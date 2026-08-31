import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { FirebaseService } from '../../../../firebase/firebase.service.js';
import type {
  IAuthService,
  DecodedAuthToken,
  CreateUserAuthParams,
  CreatedAuthUser,
} from '../../application/services/auth-service.interface.js';

@Injectable()
export class FirebaseAuthService implements IAuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async verifyIdToken(idToken: string): Promise<DecodedAuthToken> {
    const decoded = await this.firebaseService.getAuth().verifyIdToken(idToken);
    const uid = decoded.uid || decoded.sub;

    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
      throw new Error('Decoded Firebase token does not contain a valid non-empty UID');
    }

    return {
      uid: uid.trim(),
      email: decoded.email ?? null,
      name: decoded.name,
      picture: decoded.picture ?? null,
      providerId: decoded.firebase?.sign_in_provider || 'password',
    };
  }

  async createUser(params: CreateUserAuthParams): Promise<CreatedAuthUser> {
    const password =
      params.password ||
      `Pt!${crypto.randomBytes(8).toString('hex')}${crypto.randomInt(10, 99)}`;

    const userRecord = await this.firebaseService.getAuth().createUser({
      email: params.email,
      password,
      displayName: params.displayName,
      photoURL: params.photoURL || undefined,
    });

    return {
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      displayName: userRecord.displayName || params.displayName,
      photoURL: userRecord.photoURL ?? null,
    };
  }
}
