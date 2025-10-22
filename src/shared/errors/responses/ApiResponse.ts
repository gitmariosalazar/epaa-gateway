export class ApiResponse {
  status_code: number;
  time: Date = new Date();
  message: any;
  url: string;
  data: any;

  constructor(message: any, data: any, url: string, statusCode?: number) {
    this.message = typeof message === 'string' ? [message] : message;
    this.data = data;
    this.status_code = statusCode || 201;
    this.url = url.replace('uri=', '');
  }
}
