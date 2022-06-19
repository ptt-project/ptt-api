import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    HelloWorld(): Promise<{
        code: string;
        message: string;
        data: any;
    }>;
}
