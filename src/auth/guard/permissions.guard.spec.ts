import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { RpcException } from '@nestjs/microservices';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
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

  it('should allow access if no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ permissions: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access for SUPER ADMINISTRADOR bypass', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([88]);
    const context = createMockContext({
      roles: ['SUPER ADMINISTRADOR'],
      permissions: [1, 2],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has at least one of the required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([88, 89]);
    const context = createMockContext({
      roles: ['TECNICO'],
      permissions: [89],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw RpcException (FORBIDDEN) if user lacks the required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([88]);
    const context = createMockContext({
      roles: ['TECNICO'],
      permissions: [89, 76],
    });
    expect(() => guard.canActivate(context)).toThrow(RpcException);
  });
});
