import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../../../firebase/firebase.service.js';
import type { IRoomRepository } from '../../domain/room.repository.interface.js';
import type { Room } from '../../domain/room.aggregate.js';
import { RoomMapper, type FirestoreRoomDoc } from '../mappers/room.mapper.js';

@Injectable()
export class FirestoreRoomRepository implements IRoomRepository {
  private readonly logger = new Logger(FirestoreRoomRepository.name);
  private readonly collectionName = 'rooms';

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  private get firestore() {
    return this.firebaseService.getFirestore();
  }

  async findById(id: string): Promise<Room | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return null;
    }
    const snapshot = await this.collection.doc(id).get();
    if (!snapshot.exists) {
      return null;
    }
    const data = snapshot.data() as FirestoreRoomDoc;
    return RoomMapper.toDomain({
      ...data,
      id: data?.id || snapshot.id,
    });
  }

  async save(room: Room): Promise<void> {
    if (!room.id || typeof room.id !== 'string' || room.id.trim() === '') {
      throw new Error('Cannot save room without a valid non-empty ID');
    }
    const docRef = this.collection.doc(room.id);

    await this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);

      if (snapshot.exists) {
        const existingData = snapshot.data() as FirestoreRoomDoc;
        const currentStoredVersion = existingData.version || 0;
        const nextVersion = Math.max(room.version, currentStoredVersion + 1);
        room.setVersion(nextVersion);
      }

      const persistenceData = RoomMapper.toPersistence(room);
      transaction.set(docRef, persistenceData);
    });

    this.logger.debug(`Saved room ${room.id} (version ${room.version}) to Firestore`);
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return;
    }
    await this.collection.doc(id).delete();
    this.logger.debug(`Deleted room ${id} from Firestore`);
  }

  async findAll(options: import('../../domain/room.repository.interface.js').FindRoomsOptions = {}): Promise<import('../../domain/room.repository.interface.js').FindRoomsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const search = options.search?.trim().toLowerCase();
    const status = options.status;
    const deckType = options.deckType;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const snapshot = await this.collection.get();
    let allRooms: Room[] = [];

    snapshot.docs.forEach((doc) => {
      try {
        const data = doc.data() as FirestoreRoomDoc;
        const room = RoomMapper.toDomain({
          ...data,
          id: data?.id || doc.id,
        });
        allRooms.push(room);
      } catch (err) {
        this.logger.warn(`Skipping invalid room doc ${doc.id}: ${err}`);
      }
    });

    if (search) {
      allRooms = allRooms.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search) ||
          (r.facilitatorId && r.facilitatorId.toLowerCase().includes(search)),
      );
    }

    if (status && status !== 'all') {
      allRooms = allRooms.filter((r) => r.status === status);
    }

    if (deckType) {
      allRooms = allRooms.filter((r) => r.deck.type === deckType);
    }

    allRooms.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'participants') {
        valA = a.participants.size;
        valB = b.participants.size;
      } else if (sortBy === 'updatedAt') {
        valA = a.updatedAt;
        valB = b.updatedAt;
      } else {
        valA = a.createdAt;
        valB = b.createdAt;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = allRooms.length;
    const startIndex = (page - 1) * limit;
    const paginatedRooms = allRooms.slice(startIndex, startIndex + limit);

    return {
      rooms: paginatedRooms,
      total,
    };
  }

  async bulkClose(ids: string[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    const firestore = this.firebaseService.getFirestore();
    const now = Date.now();
    let updatedCount = 0;

    const chunkSize = 400;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const batch = firestore.batch();

      for (const id of chunk) {
        if (!id || typeof id !== 'string') continue;
        const docRef = this.collection.doc(id);
        batch.set(
          docRef,
          {
            status: 'closed',
            updatedAt: now,
          },
          { merge: true },
        );
        updatedCount++;
      }
      await batch.commit();
    }
    return updatedCount;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    const firestore = this.firebaseService.getFirestore();
    let deletedCount = 0;

    const chunkSize = 400;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const batch = firestore.batch();

      for (const id of chunk) {
        if (!id || typeof id !== 'string') continue;
        const docRef = this.collection.doc(id);
        batch.delete(docRef);
        deletedCount++;
      }
      await batch.commit();
    }
    return deletedCount;
  }
}
