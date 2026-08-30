import { describe, it, expect } from 'vitest';
import { User } from './user.entity.js';

describe('User Entity (Identity Domain)', () => {
  it('should create a valid user with default values', () => {
    const user = User.create('test-uid-123', {
      email: 'dev@pointify.app',
      displayName: 'Scrum Master',
    });

    expect(user.uid).toBe('test-uid-123');
    expect(user.email).toBe('dev@pointify.app');
    expect(user.displayName).toBe('Scrum Master');
    expect(user.providerId).toBe('password');
    expect(user.createdAt).toBeGreaterThan(0);
  });

  it('should update profile and touch updatedAt timestamp', () => {
    const user = User.create('test-uid-123', {
      email: 'dev@pointify.app',
      displayName: 'Old Name',
    });

    const originalUpdatedAt = user.updatedAt;

    user.updateProfile({
      displayName: 'New Lead Name',
      photoURL: 'https://pointify.app/avatar.png',
    });

    expect(user.displayName).toBe('New Lead Name');
    expect(user.photoURL).toBe('https://pointify.app/avatar.png');
    expect(user.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
  });
});
