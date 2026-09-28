import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../../../firebase/firebase.service.js';
import { JiraConnection, type JiraConnectionProps } from '../../domain/jira-connection.entity.js';
import type { IJiraConnectionRepository } from '../../domain/jira-connection.repository.interface.js';

interface FirestoreJiraDoc {
  userId: string;
  atlassianUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  accessibleResources: Array<{
    id: string;
    name: string;
    url: string;
    scopes: string[];
    avatarUrl?: string;
  }>;
  defaultCloudId: string | null;
  createdAt: number;
  updatedAt: number;
}

@Injectable()
export class FirestoreJiraConnectionRepository implements IJiraConnectionRepository {
  private readonly logger = new Logger(FirestoreJiraConnectionRepository.name);
  private readonly collectionName = 'jira_connections';

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  async findByUserId(userId: string): Promise<JiraConnection | null> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return null;
    }
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as FirestoreJiraDoc;
    const props: JiraConnectionProps = {
      userId: data.userId || userId,
      atlassianUserId: data.atlassianUserId || '',
      accessToken: data.accessToken || '',
      refreshToken: data.refreshToken || '',
      expiresAt: Number(data.expiresAt) || 0,
      accessibleResources: data.accessibleResources || [],
      defaultCloudId: data.defaultCloudId || null,
      createdAt: Number(data.createdAt) || Date.now(),
      updatedAt: Number(data.updatedAt) || Date.now(),
    };
    return JiraConnection.reconstruct(userId, props);
  }

  async save(connection: JiraConnection): Promise<void> {
    if (!connection.userId || connection.userId.trim() === '') {
      throw new Error('Cannot save Jira connection without a valid userId');
    }
    const docData: FirestoreJiraDoc = {
      userId: connection.userId,
      atlassianUserId: connection.atlassianUserId,
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      expiresAt: connection.expiresAt,
      accessibleResources: connection.accessibleResources,
      defaultCloudId: connection.defaultCloudId,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
    await this.collection.doc(connection.userId).set(docData, { merge: true });
    this.logger.debug(`Saved Jira connection for user ${connection.userId}`);
  }

  async deleteByUserId(userId: string): Promise<void> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return;
    }
    await this.collection.doc(userId).delete();
    this.logger.debug(`Deleted Jira connection for user ${userId}`);
  }
}
