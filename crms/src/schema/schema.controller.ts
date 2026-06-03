import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { SchemaService } from './schema.service';
import { SchemaDTO } from './schema.dto'

@ApiTags('Schemas')
@ApiBearerAuth()
@Controller('schemas')
export class SchemaController {
  private readonly logger = new Logger(SchemaController.name);

  constructor(private readonly schemaService: SchemaService) {}

  @Get('available-dids')
  @ApiOperation({ summary: 'List DIDs available for schema issuance' })
  async getAvailableDids(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /schemas/available-dids - tenant: ${user.tenantId}`);
    const result = await this.schemaService.getAvailableDids(user.tenantId);
    return { success: true, ...result };
  }

  @Get('by-id')
  @ApiOperation({ summary: 'Fetch a schema from the ledger by schema ID' })
  @ApiQuery({ name: 'schemaId', required: true, description: 'Full schema ID (e.g. did:indy:…)' })
  async getBySchemaId(@CurrentUser() user: JwtPayload, @Query('schemaId') schemaId: string) {
    this.logger.log(`GET /schemas/by-id?schemaId=${schemaId} - tenant: ${user.tenantId}`);
    const schema = await this.schemaService.getBySchemaId(user.tenantId, schemaId);
    return { success: true, schema };
  }

  @Get()
  @ApiOperation({ summary: 'Get all schemas created by this tenant' })
  async getAll(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /schemas - tenant: ${user.tenantId}`);
    const schemas = await this.schemaService.getAll(user.tenantId);
    return { success: true, schemas };
  }

  @Post()
  @ApiOperation({ summary: 'Register a new schema on the ledger' })
  async register(
    @CurrentUser() user: JwtPayload,
    @Body() body: SchemaDTO, SchemaDTO,
  ) {
    this.logger.log(`POST /schemas - tenant: ${user.tenantId}, schema: ${body.name} v${body.version}`);
    const result = await this.schemaService.registerSchema(
      user.tenantId,
      body.name,
      body.version,
      body.attrNames,
      body.issuerId,
    );
    return {
      success: true,
      message: 'Schema registered successfully',
      schemaId: result.schemaState.schemaId,
      schema: result.schemaState.schema,
    };
  }
}
