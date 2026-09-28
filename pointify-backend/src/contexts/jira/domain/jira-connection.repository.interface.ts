import type { JiraConnection } from './jira-connection.entity.js';

export const JIRA_CONNECTION_REPOSITORY = Symbol('JIRA_CONNECTION_REPOSITORY');

export interface IJiraConnectionRepository {
  findByUserId(userId: string): Promise<JiraConnection | null>;
  save(connection: JiraConnection): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
