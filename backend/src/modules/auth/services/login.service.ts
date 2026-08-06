import { authRepository } from '../repositories';
import { LoginDTO, LoginResponseDTO } from '../dto';
import { comparePassword, generateAccessToken, generateRefreshToken, hashRefreshToken } from '../utils';
import { AuthenticationError } from '../../../common/errors';
import ms from 'ms';
import { env } from '../../../config/env';

export const loginService = async (data: LoginDTO): Promise<LoginResponseDTO> => {
  const user = await authRepository.findUserByEmail(data.email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(data.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(refreshToken);
  
  const refreshExpiresInMs = ms(env.JWT_REFRESH_EXPIRES_IN as any) as unknown as number;
  const expiresAt = new Date(Date.now() + refreshExpiresInMs);

  await authRepository.createRefreshToken(user.id, hashedRefreshToken, expiresAt);

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor((ms(env.JWT_EXPIRES_IN as any) as unknown as number) / 1000),
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      currency: user.currency,
      timezone: user.timezone,
    },
  };
};
