import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from '../service/app.service';
import { ApiResponse } from 'src/shared/errors/responses/ApiResponse';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Req() request: Request): Promise<ApiResponse> {

    try {
      const data: { message: string } = this.appService.Home();
      return Promise.resolve(
        new ApiResponse(
          `Welcome to the API Gateway Microservices`,
          data,
          request.url
        )
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('health')
  getHealthCheck(@Req() request: Request): Promise<ApiResponse> {
    try {
      const data: { status: string; timestamp: Date } = this.appService.getHealthCheck();
      return Promise.resolve(
        new ApiResponse(
          `Health Check`,
          data,
          request.url
        )
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
