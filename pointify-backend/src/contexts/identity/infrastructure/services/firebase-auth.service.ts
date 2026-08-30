import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../../../firebase/firebase.service.js';
import type {
  IAuthService,
  DecodedAuthToken,
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
}
