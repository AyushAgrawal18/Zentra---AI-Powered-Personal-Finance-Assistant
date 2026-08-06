import { authRepository } from '../repositories';
import { RegisterDTO, RegisterResponseDTO } from '../dto';
import { hashPassword } from '../utils';
import { ConflictError } from '../../../common/errors';

export const registerService = async (data: RegisterDTO): Promise<RegisterResponseDTO> => {
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await authRepository.createUser(data.fullName, data.email, hashedPassword);

  return { userId: user.id };
};
