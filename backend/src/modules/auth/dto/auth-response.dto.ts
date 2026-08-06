export interface AuthUserDTO {
  id: string;
  fullName: string;
  email: string;
  currency?: string;
  timezone?: string;
}

export interface RegisterResponseDTO {
  userId: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserDTO;
}

export interface RefreshResponseDTO {
  accessToken: string;
  expiresIn: number;
}

export interface CurrentUserResponseDTO extends AuthUserDTO {}
