export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  payload?: T;

  constructor(success: boolean, message: string, payload?: T) {
    this.success = success;
    this.message = message;
    this.payload = payload;
  }
}
