import { describe, it, expect } from 'vitest';
import { JiraConnection } from './jira-connection.entity.js';

describe('JiraConnection Entity', () => {
  it('should create a JiraConnection with correct default values and expiration calculation', () => {
    const connection = JiraConnection.create({
      userId: 'user_123',
      atlassianUserId: 'atlassian_456',
      accessToken: 'access_token_abc',
      refreshToken: 'refresh_token_xyz',
      expiresInSeconds: 3600,
      accessibleResources: [
        {
          id: 'site_1',
          name: 'Site One',
          url: 'https://siteone.atlassian.net',
          scopes: ['read:jira-work'],
        },
      ],
    });

    expect(connection.userId).toBe('user_123');
    expect(connection.accessToken).toBe('access_token_abc');
    expect(connection.defaultCloudId).toBe('site_1');
    expect(connection.isExpired()).toBe(false);
  });

  it('should detect when token is expired or within buffer', () => {
    const connection = JiraConnection.create({
      userId: 'user_123',
      atlassianUserId: 'atlassian_456',
      accessToken: 'access_token_abc',
      refreshToken: 'refresh_token_xyz',
      expiresInSeconds: 30, // 30s < 60s buffer
      accessibleResources: [],
    });

    expect(connection.isExpired()).toBe(true);
  });

  it('should update tokens and recalculate expiration', () => {
    const connection = JiraConnection.create({
      userId: 'user_123',
      atlassianUserId: 'atlassian_456',
      accessToken: 'old_access',
      refreshToken: 'old_refresh',
      expiresInSeconds: 10,
      accessibleResources: [],
    });

    connection.updateTokens('new_access', 'new_refresh', 3600);
    expect(connection.accessToken).toBe('new_access');
    expect(connection.refreshToken).toBe('new_refresh');
    expect(connection.isExpired()).toBe(false);
  });
});
