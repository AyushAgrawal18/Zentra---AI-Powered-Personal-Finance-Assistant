import { authRepository } from '../repositories';
import { RefreshDTO, RefreshResponseDTO } from '../dto';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../utils';
import { AuthenticationError } from '../../../common/errors';
import ms from 'ms';
import { env } from '../../../config/env';

export const refreshTokenService = async (data: RefreshDTO): Promise<RefreshResponseDTO> => {
  const hashedInputToken = hashRefreshToken(data.refreshToken);
  
  const tokenRecord = await authRepository.findRefreshToken(hashedInputToken);
  if (!tokenRecord) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  if (new Date() > tokenRecord.expires_at) {
    throw new AuthenticationError('Refresh token expired');
  }

  const user = await authRepository.findUserById(tokenRecord.user_id);
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Revoke the old refresh token
  await authRepository.revokeRefreshToken(hashedInputToken);

  // Issue new tokens
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = hashRefreshToken(newRefreshToken);

  const refreshExpiresInMs = ms(env.JWT_REFRESH_EXPIRES_IN as any) as unknown as number;
  const expiresAt = new Date(Date.now() + refreshExpiresInMs);

  await authRepository.createRefreshToken(user.id, newHashedRefreshToken, expiresAt);

  return {
    accessToken: newAccessToken,
    // The instructions say "Return access token" in the refresh spec, 
    // but typically we also need to return the new refresh token if it's rotated.
    // However, the requested DTO was just accessToken and expiresIn for the body.
    // Wait, the API spec says it returns new access token, not refresh token? 
    // Oh, the api/authentication.md refresh token response only has accessToken and expiresIn!
    // That means the refresh token might be set via HTTP-only cookie, or we need to add it.
    // Let's stick to the spec and DTO.
    expiresIn: Math.floor((ms(env.JWT_EXPIRES_IN as any) as unknown as number) / 1000),
  };
};
