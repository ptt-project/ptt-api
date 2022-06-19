import { Injectable } from '@nestjs/common';
import { response } from 'src/utils/response';

@Injectable()
export class AuthService {
  constructor() {}

  async helloWorld() {
    return response(undefined);
  }
}
