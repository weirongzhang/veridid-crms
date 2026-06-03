import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { CredentialService } from './credential.service';

@ApiTags('Credentials')
@ApiBearerAuth()
@Controller('credentials')
export class CredentialController {
  private readonly logger = new Logger(CredentialController.name);

  constructor(private readonly credentialService: CredentialService) {}

  @Get()
  @ApiOperation({ summary: 'Get all credential exchange records' })
  async getAll(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /credentials - tenant: ${user.tenantId}`);
    const credentials = await this.credentialService.getAll(user.tenantId);
    return {
      success: true,
      credentials: credentials.map((c: any) => ({
        id: c.id,
        state: c.state,
        createdAt: c.createdAt,
        connectionId: c.connectionId,
      })),
    };
  }

  @Post('issue')
  @ApiOperation({ summary: 'Issue a credential to a connection via AnonCreds' })
  async issue(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      connectionId: string;
      credentialDefinitionId: string;
      attributes: Record<string, string>;
    },
  ) {
    this.logger.log(`POST /credentials/issue - tenant: ${user.tenantId}`);
    const record = await this.credentialService.issueCredential(
      user.tenantId,
      body.connectionId,
      body.credentialDefinitionId,
      body.attributes,
    );
    return {
      success: true,
      credential: {
        id: record.id,
        state: record.state,
        connectionId: record.connectionId,
        threadId: (record as any).threadId,
        credentialDefinitionId: body.credentialDefinitionId,
      },
    };
  }

  @Get(':credentialId')
  @ApiOperation({ summary: 'Get a credential exchange record by ID' })
  async getById(@CurrentUser() user: JwtPayload, @Param('credentialId') credentialId: string) {
    this.logger.log(`GET /credentials/${credentialId} - tenant: ${user.tenantId}`);
    const credential = await this.credentialService.getById(user.tenantId, credentialId);
    if (!credential) {
      throw new NotFoundException(`Credential ${credentialId} not found`);
    }
    return {
      success: true,
      credential: {
        id: credential.id,
        state: credential.state,
        createdAt: credential.createdAt,
        connectionId: credential.connectionId,
        attributes: (credential as any).credentialAttributes,
      },
    };
  }
}
