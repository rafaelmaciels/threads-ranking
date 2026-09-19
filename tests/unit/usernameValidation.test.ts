import { describe, it, expect } from 'vitest';
import { UsernameSchema } from '@/domain/profiles/types';

describe('UsernameSchema', () => {
  it('deve normalizar e remover o caractere @ inicial', () => {
    expect(UsernameSchema.parse('@usuario')).toBe('usuario');
    expect(UsernameSchema.parse('usuario')).toBe('usuario');
    expect(UsernameSchema.parse('  @meu.perfil_123  ')).toBe('meu.perfil_123');
  });

  it('deve rejeitar usernames com caracteres proibidos ou vazios', () => {
    expect(() => UsernameSchema.parse('')).toThrow();
    expect(() => UsernameSchema.parse('usuario/teste')).toThrow();
    expect(() => UsernameSchema.parse('usuario com espacos')).toThrow();
    expect(() => UsernameSchema.parse('a'.repeat(31))).toThrow();
  });
});
