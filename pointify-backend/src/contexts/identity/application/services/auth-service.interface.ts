export interface DecodedAuthToken {
  uid: string;
  email: string | null;
  name?: string;
  picture?: string | null;
  providerId: string;
}

export interface CreateUserAuthParams {
  email: string;
  password?: string;
  displayName: string;
  photoURL?: string | null;
}

export interface CreatedAuthUser {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
}

export interface IAuthService {
  verifyIdToken(idToken: string): Promise<DecodedAuthToken>;
  createUser(params: CreateUserAuthParams): Promise<CreatedAuthUser>;
}

export const AUTH_SERVICE = Symbol('IAuthService');
