import type { Permission } from '@/constants/permissions';

export interface LoginPayload {
  phoneNumber: string;
  password: string;
}

export interface LoginApiUserResponse {
  Id?: string;
  id?: string;
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  Email?: string;
  email?: string;
  PhoneNumber?: string;
  phoneNumber?: string;
  PhoneNumberVerified?: boolean;
  phoneNumberVerified?: boolean;
  PhoneNumberVerifiedAt?: string;
  phoneNumberVerifiedAt?: string;
  Latitude?: number;
  latitude?: number;
  Longitude?: number;
  longitude?: number;
}

export interface LoginApiResponse {
  Token?: string;
  token?: string;
  ExpiresAt?: string;
  expiresAt?: string;
  User?: LoginApiUserResponse;
  user?: LoginApiUserResponse;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  phoneNumberVerifiedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  permissions: Permission[];
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}
