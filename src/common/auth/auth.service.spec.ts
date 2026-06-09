import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { AuthService } from './auth.service';
import { JwtUtility } from '../../libs/jwt/jwt.utility';

describe('Common AuthService', () => {
  let clientsService: {
    findByUsername: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };
  let service: AuthService;

  beforeEach(() => {
    process.env.CLIENT_JWT_SECRET = 'client-test-secret';
    clientsService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    service = new AuthService(clientsService as any);
  });

  it('rejects sign up when username already exists', async () => {
    clientsService.findByUsername.mockResolvedValue({ _id: 'existing-id' });

    await expect(
      service.signUpClient({ username: 'taken', password: 'password' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(clientsService.create).not.toHaveBeenCalled();
  });

  it('returns token and public client payload after successful sign in', async () => {
    const password = await hash('secret', 1);
    clientsService.findByUsername.mockResolvedValue({
      _id: { toString: () => 'client-id' },
      username: 'client',
      password,
      balance: 42,
    });

    const result = await service.signInClient({
      username: 'client',
      password: 'secret',
    });

    expect(result.client).toEqual({
      id: 'client-id',
      username: 'client',
      balance: 42,
    });
    await expect(
      JwtUtility.clientIdFromHeader(`Bearer ${result.token}`),
    ).resolves.toBe('client-id');
  });

  it('rejects sign in with invalid credentials', async () => {
    clientsService.findByUsername.mockResolvedValue(null);

    await expect(
      service.signInClient({ username: 'missing', password: 'bad' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('loads authorized client from bearer token', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const token = JwtUtility.generateAccessToken('client-id', 'client');
    clientsService.findById.mockResolvedValue({
      _id: { toString: () => 'client-id' },
      username: 'client',
      balance: undefined,
      createdAt,
      updatedAt,
    });

    await expect(
      service.getAuthorizedClient(`Bearer ${token}`, undefined),
    ).resolves.toEqual({
      id: 'client-id',
      username: 'client',
      balance: 0,
      createdAt,
      updatedAt,
    });
  });
});
