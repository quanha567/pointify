import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../../../firebase/firebase.service.js';
import type {
  IUserRepository,
  FindUsersOptions,
  FindUsersResult,
} from '../../domain/user.repository.interface.js';
import type { User } from '../../domain/user.entity.js';
import { UserMapper, type FirestoreUserDoc } from '../mappers/user.mapper.js';

@Injectable()
export class FirestoreUserRepository implements IUserRepository {
  private readonly logger = new Logger(FirestoreUserRepository.name);
  private readonly collectionName = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  async findByUid(uid: string): Promise<User | null> {
    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
      return null;
    }
    const snapshot = await this.collection.doc(uid).get();
    if (!snapshot.exists) {
      return null;
    }
    return UserMapper.toDomain(snapshot.data() as FirestoreUserDoc, snapshot.id);
  }

  async save(user: User): Promise<void> {
    if (!user.uid || typeof user.uid !== 'string' || user.uid.trim() === '') {
      throw new Error('Cannot save user without a valid non-empty UID');
    }
    const docData = UserMapper.toPersistence(user);
    await this.collection.doc(user.uid).set(docData, { merge: true });
    this.logger.debug(`Saved user ${user.uid} to Firestore`);
  }

  async findAll(options: FindUsersOptions = {}): Promise<FindUsersResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const search = options.search?.toLowerCase().trim() || '';
    const role = options.role;
    const status = options.status;
    const providerId = options.providerId;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const snapshot = await this.collection.get();
    let allUsers: User[] = [];

    snapshot.forEach((doc) => {
      try {
        const user = UserMapper.toDomain(doc.data() as FirestoreUserDoc, doc.id);
        allUsers.push(user);
      } catch (err) {
        this.logger.warn(`Skipping invalid user doc ${doc.id}: ${err}`);
      }
    });

    if (search) {
      allUsers = allUsers.filter(
        (u) =>
          u.displayName.toLowerCase().includes(search) ||
          (u.email && u.email.toLowerCase().includes(search)) ||
          u.uid.toLowerCase().includes(search),
      );
    }

    if (role) {
      allUsers = allUsers.filter((u) => u.role === role);
    }

    if (status) {
      allUsers = allUsers.filter((u) => u.status === status);
    }

    if (providerId) {
      allUsers = allUsers.filter((u) => u.providerId === providerId);
    }

    allUsers.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortBy === 'displayName') {
        valA = a.displayName.toLowerCase();
        valB = b.displayName.toLowerCase();
      } else if (sortBy === 'email') {
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
      } else if (sortBy === 'lastLoginAt') {
        valA = a.lastLoginAt;
        valB = b.lastLoginAt;
      } else {
        valA = a.createdAt;
        valB = b.createdAt;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(startIndex, startIndex + limit);

    return {
      users: paginatedUsers,
      total,
    };
  }
}

