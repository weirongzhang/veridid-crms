import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-auth.guard';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user and create a Credo tenant' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  async register(
    @Body() body: { email: string; password: string; firstName?: string; lastName?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`POST /auth/register - ${body.email}`);
    const { user, accessToken, refreshToken } = await this.authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
    );
    this.setRefreshCookie(res, refreshToken);
    return {
      success: true,
      message: 'Registration successful',
      accessToken,
      user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role },
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string' }, password: { type: 'string' } },
      required: ['email', 'password'],
    },
  })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`POST /auth/login - ${body.email}`);
    const { user, accessToken, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );
    this.setRefreshCookie(res, refreshToken);
    return {
      success: true,
      accessToken,
      user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role },
    };
  }

  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify the current access token' })
  async verify(@CurrentUser() user: JwtPayload) {
    return { success: true, user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens using the refresh cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }
    const { accessToken, refreshToken } = await this.authService.refresh(token);
    this.setRefreshCookie(res, refreshToken);
    return { success: true, accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear the refresh token cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { success: true, message: 'Logged out' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } }, required: ['email'] } })
  async forgotPassword(@Body() body: { email: string }) {
    this.logger.log(`POST /auth/forgot-password - ${body.email}`);
    await this.authService.forgotPassword(body.email);
    return { success: true, message: 'If that email exists, a reset link has been sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a valid reset token' })
  @ApiBody({
    schema: {
      properties: { token: { type: 'string' }, newPassword: { type: 'string' } },
      required: ['token', 'newPassword'],
    },
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.authService.resetPassword(body.token, body.newPassword);
    return { success: true, message: 'Password reset successfully' };
  }

  @Public()
  @Post('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check whether a password reset token is still valid' })
  @ApiBody({ schema: { properties: { token: { type: 'string' } }, required: ['token'] } })
  async validateResetToken(@Body() body: { token: string }) {
    return this.authService.validateResetToken(body.token);
  }
}
