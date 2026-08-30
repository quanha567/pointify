import { User } from '../../domain/user.entity.js';
import type { UserProfileDto } from '../../application/dtos/user.dto.js';

export interface FirestoreUserDoc {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  providerId: string;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

export class UserMapper {
  public static toDto(user: User): UserProfileDto {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerId,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  public static toPersistence(user: User): FirestoreUserDoc {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerId,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  public static toDomain(doc: FirestoreUserDoc, fallbackUid?: string): User {
    const uid = doc.uid || fallbackUid;
    if (!uid) {
      throw new Error('Cannot construct User entity without a valid UID');
    }
    return User.create(uid, {
      email: doc.email ?? null,
      displayName: doc.displayName,
      photoURL: doc.photoURL ?? null,
      providerId: doc.providerId || 'password',
      role: doc.role || 'member',
      status: doc.status || 'active',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastLoginAt: doc.lastLoginAt,
    });
  }
}

