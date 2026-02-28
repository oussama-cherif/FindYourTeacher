import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com' });

      await expect(
        service.register({
          email: 'a@b.com',
          password: 'password123',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: 'new@test.com',
        role: 'STUDENT',
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        fullName: 'New User',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@test.com',
          passwordHash: 'hashed-pw',
        }),
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    it('should reject non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@one.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        passwordHash: 'hash',
        isActive: true,
        role: 'STUDENT',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject inactive account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        passwordHash: 'hash',
        isActive: false,
        role: 'STUDENT',
      });

      await expect(
        service.login({ email: 'a@b.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        passwordHash: 'hash',
        isActive: true,
        role: 'STUDENT',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({});

      const result = await service.login({
        email: 'a@b.com',
        password: 'pass',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refreshTokens', () => {
    it('should reject if user has no stored refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        refreshToken: null,
      });

      await expect(service.refreshTokens('1', 'some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should wipe tokens on reuse detection (mismatched token)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        role: 'STUDENT',
        refreshToken: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.update.mockResolvedValue({});

      await expect(service.refreshTokens('1', 'stolen-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: null },
      });
    });

    it('should rotate tokens on valid refresh', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        role: 'STUDENT',
        refreshToken: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      prisma.user.update.mockResolvedValue({});

      const result = await service.refreshTokens('1', 'valid-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      // Should update the stored hash (rotation)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { refreshToken: 'new-hash' },
        }),
      );
    });
  });
});
