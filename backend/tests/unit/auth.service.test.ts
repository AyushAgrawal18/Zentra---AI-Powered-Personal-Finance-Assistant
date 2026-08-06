import { registerService } from '../../src/modules/auth/services/register.service';
import { authRepository } from '../../src/modules/auth/repositories';
import { ConflictError } from '../../src/common/errors';
import * as utils from '../../src/modules/auth/utils';

jest.mock('../../src/modules/auth/repositories');
jest.mock('../../src/modules/auth/utils', () => ({
  ...jest.requireActual('../../src/modules/auth/utils'),
  hashPassword: jest.fn(),
}));

describe('Auth Services - Unit', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerService', () => {
    it('should successfully register a new user', async () => {
      (authRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (utils.hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      (authRepository.createUser as jest.Mock).mockResolvedValue({ id: 'uuid-123' });

      const result = await registerService({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(result).toEqual({ userId: 'uuid-123' });
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(authRepository.createUser).toHaveBeenCalledWith('Test User', 'test@example.com', 'hashed_password');
    });

    it('should throw ConflictError if email already exists', async () => {
      (authRepository.findUserByEmail as jest.Mock).mockResolvedValue({ id: 'uuid-123' });

      await expect(registerService({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
      })).rejects.toThrow(ConflictError);
    });
  });
});
