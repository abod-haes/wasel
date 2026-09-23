import type { Permission } from '@/constants/permissions';

export interface LoginPayload {
  countryCallingCode: string;
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
  CountryCallingCode?: string;
  countryCallingCode?: string;
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
  roles: string[];
  countryCallingCode: string;
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
