export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'therapist';
  permissions: Permission[];
  profile: UserProfile;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  specialization?: string;
  licenseNumber?: string;
  avatar?: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  getCurrentUser(): User | null;
  checkPermission(resource: string, action: string): boolean;
}