import { SetMetadata } from '@nestjs/common';

export const AllowedUserTypes = (...types: ('employee' | 'customer')[]) => SetMetadata('user_types', types);
