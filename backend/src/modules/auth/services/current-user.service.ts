import { authRepository } from '../repositories';
import { CurrentUserResponseDTO } from '../dto';
import { NotFoundError } from '../../../common/errors';

export const currentUserService = async (userId: string): Promise<CurrentUserResponseDTO> => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    currency: user.currency,
    timezone: user.timezone,
  };
};
