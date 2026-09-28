import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraController } from './jira.controller.js';
import type { IAuthService } from '../../../identity/application/services/auth-service.interface.js';

describe('JiraController', () => {
  let controller: JiraController;
  const mockAuthService: IAuthService = {
    verifyIdToken: vi.fn().mockResolvedValue({ uid: 'test-user-123', email: 'test@example.com', providerId: 'firebase' }),
    createUser: vi.fn(),
  };

  const mockDisconnectUseCase = {
    execute: vi.fn().mockResolvedValue({ success: true }),
  };

  const mockStatusUseCase = {
    execute: vi.fn().mockResolvedValue({ isConnected: false, defaultCloudId: null, sites: [] }),
  };

  beforeEach(() => {
    controller = new JiraController(
      mockAuthService,
      {} as any,
      {} as any,
      mockStatusUseCase as any,
      mockDisconnectUseCase as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('should disconnect successfully', async () => {
    const mockReq = {
      headers: { authorization: 'Bearer valid-token' },
      cookies: {},
    } as any;

    const result = await controller.disconnect(mockReq);
    expect(result).toEqual({ success: true });
    expect(mockDisconnectUseCase.execute).toHaveBeenCalledWith('test-user-123');
  });
});
