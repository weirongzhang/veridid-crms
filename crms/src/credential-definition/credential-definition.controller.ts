import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { CredentialDefinitionService } from './credential-definition.service';
import { CreateCredentialDefinitionDto } from './credential-definition.dto';

@ApiTags('Credential Definitions')
@ApiBearerAuth()
@Controller('credential-definitions')
export class CredentialDefinitionController {
  private readonly logger = new Logger(CredentialDefinitionController.name);

  constructor(private readonly credDefService: CredentialDefinitionService) {}

  @Get('by-id')
  @ApiOperation({ summary: 'Get a credential definition from the ledger by ID' })
  @ApiQuery({ name: 'credDefId', required: true, description: 'Full credential definition ID' })
  async getById(@CurrentUser() user: JwtPayload, @Query('credDefId') credDefId: string) {
    this.logger.log(`GET /credential-definitions/by-id?credDefId=${credDefId} - tenant: ${user.tenantId}`);
    const credDef = await this.credDefService.getById(user.tenantId, credDefId);
    return {
      success: true,
      credentialDefinition: credDef,
      schemaId: credDef.credentialDefinition.schemaId,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all credential definitions created by this tenant' })
  async getAll(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /credential-definitions - tenant: ${user.tenantId}`);
    const credentialDefinitions = await this.credDefService.getAll(user.tenantId);
    return { success: true, credentialDefinitions };
  }

  @Post()
  @ApiOperation({ summary: 'Register a new AnonCreds credential definition on the ledger' })
  async register(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateCredentialDefinitionDto,
  ) {
    this.logger.log(`POST /credential-definitions - tenant: ${user.tenantId}, schema: ${body.schemaId}, tag: ${body.tag}`);
    const result = await this.credDefService.register(
      user.tenantId,
      body.schemaId,
      body.tag,
      body.supportRevocation,
    );
    return {
      success: true,
      message: 'Credential definition registered successfully',
      credentialDefinitionId: result.credentialDefinitionState.credentialDefinitionId,
      credentialDefinition: result.credentialDefinitionState.credentialDefinition,
    };
  }
}
