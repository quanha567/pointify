export interface DecodedAuthToken {
  uid: string;
  email: string | null;
  name?: string;
  picture?: string | null;
  providerId: string;
}

export interface IAuthService {
  verifyIdToken(idToken: string): Promise<DecodedAuthToken>;
}

export const AUTH_SERVICE = Symbol('IAuthService');
