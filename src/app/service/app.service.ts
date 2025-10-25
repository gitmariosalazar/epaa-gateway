import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  Home(): {
    message: string;
  } {
    return {
      message: 'Hello World! Welcome to the API Gateway Microservices - Development Environment 🚀',
    };
  }

  getHealthCheck(): {
    status: string;
    timestamp: Date;
  } {
    return {
      status: 'healthy',
      timestamp: new Date(),
    };
  }
}
