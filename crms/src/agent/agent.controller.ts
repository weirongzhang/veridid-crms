import { Body, Controller, Get, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { AgentService } from './agent.service';

@ApiTags('Agent')
@ApiBearerAuth()
@Controller('agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  @Public()
  @Get('test')
  test(): string {
    this.logger.log('GET /agent/test');
    return this.agentService.test();
  }

  @Get('connections')
  async getConnections() {
    this.logger.log('GET /agent/connections');
    return this.agentService.getConnections();
  }

  @Get('invitation')
  async createInvitation(): Promise<string> {
    this.logger.log('GET /agent/invitation');
    return this.agentService.createOobInvitationUrl();
  }

  @Post('initialize')
  @HttpCode(200)
  @ApiOperation({ summary: 'Initialize or get an agent for a tenant' })
  @ApiBody({ schema: { properties: { tenantId: { type: 'string' } }, required: ['tenantId'] } })
  async initialize(@Body() body: { tenantId: string }) {
    this.logger.log(`POST /agent/initialize - tenant: ${body.tenantId}`);
    if (!body.tenantId) {
      return { success: false, message: 'Tenant ID is required' };
    }
    try {
      await this.agentService.getAgent(body.tenantId);
      return { success: true, message: 'Agent initialized successfully', tenantId: body.tenantId };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to initialize agent' };
    }
  }

  @Post('validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate tenant credentials' })
  @ApiBody({ schema: { properties: { tenantId: { type: 'string' } }, required: ['tenantId'] } })
  async validate(@Body() body: { tenantId: string }) {
    this.logger.log(`POST /agent/validate - tenant: ${body.tenantId}`);
    if (!body.tenantId) {
      return { success: false, message: 'Tenant ID is required' };
    }
    const isValid = await this.agentService.validateCredentials(body.tenantId);
    return {
      success: isValid,
      message: isValid ? 'Credentials are valid' : 'Invalid credentials',
    };
  }

  @Post('tenant')
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiBody({ schema: { properties: { label: { type: 'string' } }, required: ['label'] } })
  async createTenant(@Body() body: { label: string }) {
    this.logger.log(`POST /agent/tenant - label: ${body.label}`);
    if (!body.label) {
      return { success: false, message: 'Tenant label is required' };
    }
    try {
      const tenant = await this.agentService.createTenant(body.label);
      return { success: true, message: 'Tenant created successfully', tenantId: tenant.tenantId };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create tenant' };
    }
  }
}
