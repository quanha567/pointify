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
}
