export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidUsernameError extends AppError {
  constructor(message = 'O nome de usuário informado é inválido.') {
    super(message, 400, 'INVALID_USERNAME');
  }
}

export class ProfileNotFoundError extends AppError {
  constructor(username: string) {
    super(`Perfil @${username} não foi encontrado.`, 404, 'PROFILE_NOT_FOUND');
  }
}

export class ProviderAuthenticationError extends AppError {
  constructor(providerName: string, message = 'Falha de autenticação com o provedor de dados.') {
    super(`[${providerName}] ${message}`, 401, 'PROVIDER_AUTHENTICATION_ERROR');
  }
}

export class ProviderRateLimitError extends AppError {
  constructor(providerName: string, retryAfterSeconds?: number) {
    super(
      `[${providerName}] Limite de requisições excedido.${retryAfterSeconds ? ` Tente novamente em ${retryAfterSeconds}s.` : ''}`,
      429,
      'PROVIDER_RATE_LIMIT_ERROR'
    );
  }
}

export class ProviderNotFoundError extends AppError {
  constructor(providerName: string, resource: string) {
    super(`[${providerName}] Recurso '${resource}' não encontrado.`, 404, 'PROVIDER_NOT_FOUND');
  }
}

export class ProviderUnavailableError extends AppError {
  constructor(providerName: string, message = 'O serviço do provedor está temporariamente indisponível.') {
    super(`[${providerName}] ${message}`, 503, 'PROVIDER_UNAVAILABLE');
  }
}

export class UnsupportedCapabilityError extends AppError {
  constructor(providerName: string, capability: string, details?: string) {
    super(
      `[${providerName}] Funcionalidade '${capability}' não é suportada por este provedor.${details ? ` Motivo: ${details}` : ''}`,
      501,
      'UNSUPPORTED_CAPABILITY'
    );
  }
}
