import { authRepository } from '../repositories';

export const logoutService = async (userId: string): Promise<void> => {
  await authRepository.revokeAllUserRefreshTokens(userId);
};
