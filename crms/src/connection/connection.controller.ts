import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import * as QRCode from 'qrcode';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { ConnectionService } from './connection.service';

@ApiTags('Connections')
@ApiBearerAuth()
@Controller('connections')
export class ConnectionController {
  private readonly logger = new Logger(ConnectionController.name);

  constructor(private readonly connectionService: ConnectionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all connections and pending invitations' })
  async getAll(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /connections - tenant: ${user.tenantId}`);
    const result = await this.connectionService.getAll(user.tenantId);
    return { success: true, ...result };
  }

  @Get('invitation/qr')
  @Public()
  @ApiOperation({
    summary: 'Render an invitation URL as a QR code PNG image',
    description: 'Pass the full invitation URL from POST /connections/invitation. Open this endpoint in a browser or img tag to display the QR code for a mobile wallet to scan.',
  })
  @ApiQuery({ name: 'url', required: true, description: 'The full OOB invitation URL' })
  async invitationQr(
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /connections/invitation/qr`);
    const png = await QRCode.toBuffer(url, { width: 400, margin: 2 });
    res.setHeader('Content-Type', 'image/png');
    res.end(png);
  }

  @Get('messages/:connectionId')
  @ApiOperation({ summary: 'Get basic messages for a connection' })
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('connectionId') connectionId: string,
  ) {
    this.logger.log(`GET /connections/messages/${connectionId} - tenant: ${user.tenantId}`);
    const messages = await this.connectionService.getMessages(user.tenantId, connectionId);
    return { success: true, messages };
  }

  @Get(':connectionId')
  @ApiOperation({ summary: 'Get a connection by ID' })
  async getById(
    @CurrentUser() user: JwtPayload,
    @Param('connectionId') connectionId: string,
  ) {
    this.logger.log(`GET /connections/${connectionId} - tenant: ${user.tenantId}`);
    const connection = await this.connectionService.getById(user.tenantId, connectionId);
    if (!connection) {
      throw new NotFoundException(`Connection ${connectionId} not found`);
    }
    return {
      success: true,
      connection: {
        id: connection.id,
        createdAt: connection.createdAt,
        state: connection.state,
        role: connection.role,
        theirLabel: (connection as any).theirLabel,
        theirDid: (connection as any).theirDid,
        threadId: (connection as any).threadId,
        autoAcceptConnection: (connection as any).autoAcceptConnection,
      },
    };
  }

  @Post('invitation')
  @ApiOperation({ summary: 'Create a new OOB invitation' })
  async createInvitation(@CurrentUser() user: JwtPayload, @Body() body: { label?: string }) {
    this.logger.log(`POST /connections/invitation - tenant: ${user.tenantId}`);
    const invitation = await this.connectionService.createInvitation(user.tenantId, body?.label);
    const qrUrl = `http://localhost:3000/connections/invitation/qr?url=${encodeURIComponent(invitation.url)}`;
    return { success: true, invitation, qrCodeUrl: qrUrl };
  }

  @Post('receive-invitation')
  @ApiOperation({ summary: 'Receive an invitation from a URL and establish a connection' })
  async receiveInvitation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { invitationUrl: string },
  ) {
    this.logger.log(`POST /connections/receive-invitation - tenant: ${user.tenantId}`);
    const { connectionRecord } = await this.connectionService.receiveInvitation(
      user.tenantId,
      body.invitationUrl,
    );
    if (!connectionRecord) {
      return { success: false, message: 'Failed to create connection from invitation' };
    }
    return {
      success: true,
      connection: {
        id: connectionRecord.id,
        state: connectionRecord.state,
        role: connectionRecord.role,
        theirLabel: (connectionRecord as any).theirLabel,
        createdAt: connectionRecord.createdAt,
      },
    };
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a basic message to a connection' })
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Body() body: { connectionId: string; message: string },
  ) {
    this.logger.log(`POST /connections/message - tenant: ${user.tenantId}`);
    const m = await this.connectionService.sendMessage(user.tenantId, body.connectionId, body.message);
    return { success: true, message: m };
  }
}
