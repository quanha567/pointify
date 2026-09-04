import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app!: App;

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const existingApps = getApps();
    if (existingApps.length > 0 && existingApps[0]) {
      this.app = existingApps[0];
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'pointify-app';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      this.app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      this.logger.log(
        `Initialized Firebase Admin SDK with Service Account for project: ${projectId}`,
      );
    } else {
      // Fallback for local development/testing
      this.app = initializeApp({
        projectId,
      });
      this.logger.warn(`Initialized Firebase Admin SDK with project ID (${projectId}).`);
    }
  }

  getAuth(): Auth {
    return getAuth(this.app);
  }

  getFirestore(): Firestore {
    const db = getFirestore(this.app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // settings may only be set once
    }
    return db;
  }
}
