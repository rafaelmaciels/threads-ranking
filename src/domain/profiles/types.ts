import { z } from 'zod';

export const UsernameSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/^@/, ''))
  .refine((val) => /^[a-zA-Z0-9._]{1,30}$/.test(val), {
    message: 'Nome de usuário inválido. Use de 1 a 30 caracteres (letras, números, pontos e sublinhados).',
  });

export interface ThreadsProfile {
  id: string;
  threadsId?: string;
  username: string;
  name?: string;
  biography?: string;
  profilePictureUrl?: string;
  isVerified?: boolean;
  followerCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastSyncedAt?: Date | null;
}
