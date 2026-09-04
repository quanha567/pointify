import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../../../firebase/firebase.service.js';
import type {
  AdminOverviewResponseDto,
  ActivityTrendItemDto,
  DeckDistributionItemDto,
  RecentActivityItemDto,
} from '../../presentation/dtos/admin-overview.dto.js';

interface CacheEntry {
  data: AdminOverviewResponseDto;
  cachedAt: number;
}

@Injectable()
export class GetAdminOverviewUseCase {
  private readonly logger = new Logger(GetAdminOverviewUseCase.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly firebaseService: FirebaseService) {}

  async execute(range: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<AdminOverviewResponseDto> {
    const cacheKey = `overview_${range}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      this.logger.debug(`Returning cached admin overview for range: ${range}`);
      return cached.data;
    }

    const firestore = this.firebaseService.getFirestore();
    const usersCollection = firestore.collection('users');
    const roomsCollection = firestore.collection('rooms');

    const [usersSnapshot, roomsSnapshot] = await Promise.all([
      usersCollection.get(),
      roomsCollection.get(),
    ]);

    let totalAccounts = 0;
    let activeAccounts = 0;
    let disabledAccounts = 0;
    const userDocs: Array<{ uid: string; displayName: string; email: string; createdAt: number; status?: string }> = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalAccounts++;
      if (data.status === 'disabled') {
        disabledAccounts++;
      } else {
        activeAccounts++;
      }
      userDocs.push({
        uid: doc.id,
        displayName: data.displayName || 'Unknown User',
        email: data.email || '',
        createdAt: data.createdAt || now,
        status: data.status || 'active',
      });
    });

    let totalRooms = 0;
    let activeRooms = 0;
    let totalRounds = 0;
    let totalEstimates = 0;
    const deckCounts = new Map<string, number>();

    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const roomDocs: Array<{
      id: string;
      name: string;
      createdAt: number;
      deckType: string;
      roundsCount: number;
      roundTimestamps: number[];
    }> = [];

    roomsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRooms++;

      const updatedAt = data.updatedAt || data.createdAt || 0;
      if (updatedAt >= sevenDaysAgo) {
        activeRooms++;
      }

      const deckType = (data.deck?.type || 'fibonacci').toLowerCase();
      deckCounts.set(deckType, (deckCounts.get(deckType) || 0) + 1);

      const history = Array.isArray(data.roundsHistory) ? data.roundsHistory : [];
      const currentRound = data.currentRound;

      let rCount = history.length;
      if (currentRound) {
        rCount += 1;
      }
      totalRounds += rCount;

      const roundTimestamps: number[] = [];

      for (const r of history) {
        if (r.startedAt) roundTimestamps.push(r.startedAt);
        if (Array.isArray(r.estimates)) {
          totalEstimates += r.estimates.length;
        }
      }

      if (currentRound) {
        if (currentRound.startedAt) roundTimestamps.push(currentRound.startedAt);
        if (Array.isArray(currentRound.estimates)) {
          totalEstimates += currentRound.estimates.length;
        }
      }

      roomDocs.push({
        id: doc.id,
        name: data.name || `Phòng ${doc.id.slice(0, 6)}`,
        createdAt: data.createdAt || now,
        deckType,
        roundsCount: rCount,
        roundTimestamps,
      });
    });

    // 1. Calculate time range cutoff
    let daysCount = 30;
    if (range === '7d') daysCount = 7;
    else if (range === '90d') daysCount = 90;
    else if (range === 'all') daysCount = 180; // limit all to last 180 days for charts to stay readable

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (daysCount - 1));
    const startTimestamp = startDate.getTime();

    // 2. Generate date map for trends
    const trendMap = new Map<string, { accounts: number; rooms: number; rounds: number }>();
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startTimestamp + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0]!;
      trendMap.set(dateStr, { accounts: 0, rooms: 0, rounds: 0 });
    }

    // Populate user counts
    for (const u of userDocs) {
      if (u.createdAt >= startTimestamp) {
        const dateStr = new Date(u.createdAt).toISOString().split('T')[0]!;
        const entry = trendMap.get(dateStr);
        if (entry) {
          entry.accounts += 1;
        }
      }
    }

    // Populate room and round counts
    for (const r of roomDocs) {
      if (r.createdAt >= startTimestamp) {
        const dateStr = new Date(r.createdAt).toISOString().split('T')[0]!;
        const entry = trendMap.get(dateStr);
        if (entry) {
          entry.rooms += 1;
        }
      }

      for (const rt of r.roundTimestamps) {
        if (rt >= startTimestamp) {
          const dateStr = new Date(rt).toISOString().split('T')[0]!;
          const entry = trendMap.get(dateStr);
          if (entry) {
            entry.rounds += 1;
          }
        }
      }
    }

    const trends: ActivityTrendItemDto[] = Array.from(trendMap.entries()).map(([date, counts]) => ({
      date,
      accounts: counts.accounts,
      rooms: counts.rooms,
      rounds: counts.rounds,
    }));

    // 3. Calculate deck distribution
    const deckDistribution: DeckDistributionItemDto[] = [];
    const totalDeckRooms = totalRooms || 1;
    deckCounts.forEach((count, deckType) => {
      deckDistribution.push({
        deckType,
        count,
        percentage: Number(((count / totalDeckRooms) * 100).toFixed(1)),
      });
    });
    deckDistribution.sort((a, b) => b.count - a.count);

    // 4. Calculate recent activities
    const recentActivities: RecentActivityItemDto[] = [];

    for (const u of userDocs) {
      recentActivities.push({
        id: `user_${u.uid}`,
        type: 'user_registered',
        title: u.displayName,
        subtitle: u.email || 'Đăng ký tài khoản mới',
        timestamp: u.createdAt,
      });
    }

    for (const r of roomDocs) {
      recentActivities.push({
        id: `room_${r.id}`,
        type: 'room_created',
        title: r.name,
        subtitle: `Mã phòng: ${r.id}`,
        timestamp: r.createdAt,
      });
    }

    recentActivities.sort((a, b) => b.timestamp - a.timestamp);
    const topRecent = recentActivities.slice(0, 8);

    const result: AdminOverviewResponseDto = {
      success: true,
      summary: {
        totalAccounts,
        activeAccounts,
        disabledAccounts,
        totalRooms,
        activeRooms,
        totalRounds,
        totalEstimates,
      },
      trends,
      deckDistribution,
      recentActivities: topRecent,
    };

    this.cache.set(cacheKey, { data: result, cachedAt: now });
    return result;
  }

  clearCache() {
    this.cache.clear();
  }
}
