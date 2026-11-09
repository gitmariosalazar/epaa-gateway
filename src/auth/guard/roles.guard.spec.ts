import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RpcException } from '@nestjs/microservices';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: Record<string, unknown>): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ roles: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access for SUPER ADMINISTRADOR bypass', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPERVISOR']);
    const context = createMockContext({
      roles: ['SUPER ADMINISTRADOR'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has one of the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      'SUPERVISOR DE OPERACIONES Y CUADRILLAS',
      'ADMINISTRADOR COMERCIAL',
    ]);
    const context = createMockContext({
      roles: ['SUPERVISOR DE OPERACIONES Y CUADRILLAS'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw RpcException (FORBIDDEN) if user lacks the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPERVISOR']);
    const context = createMockContext({
      roles: ['TECNICO REDES OPERATIVAS'],
    });
    expect(() => guard.canActivate(context)).toThrow(RpcException);
  });
});
