import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { DidService } from './did.service';
import { CreateDidDto, ImportSeedDidDto } from './did.dto';

@ApiTags('DIDs')
@ApiBearerAuth()
@Controller('dids')
export class DidController {
  private readonly logger = new Logger(DidController.name);

  constructor(private readonly didService: DidService) {}

  @Get()
  @ApiOperation({ summary: 'List all DIDs created by this tenant' })
  async getAll(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /dids - tenant: ${user.tenantId}`);
    const dids = await this.didService.getAll(user.tenantId);
    return { success: true, dids };
  }

  @Get('resolve/:did')
  @ApiOperation({ summary: 'Resolve any DID document' })
  @ApiParam({ name: 'did', description: 'URL-encoded DID string' })
  async resolve(@CurrentUser() user: JwtPayload, @Param('did') did: string) {
    this.logger.log(`GET /dids/resolve/${did} - tenant: ${user.tenantId}`);
    const result = await this.didService.resolve(user.tenantId, decodeURIComponent(did));
    return {
      success: true,
      didDocument: result.didDocument,
      didResolutionMetadata: result.didResolutionMetadata,
    };
  }

  @Post('import-seed')
  @ApiOperation({
    summary: 'Import a DID registered on the ledger via seed',
    description: 'Use the seed, verkey, and short DID from genesis.digicred.services to import the DID into your wallet.',
  })
  async importFromSeed(
    @CurrentUser() user: JwtPayload,
    @Body() body: ImportSeedDidDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Your account has no SSI wallet. Please register a new account.');
    }
    this.logger.log(`POST /dids/import-seed - tenant: ${user.tenantId}, did: ${body.did}`);
    try {
      const result = await this.didService.importFromSeed(
        user.tenantId,
        body.seed,
        body.verkey,
        body.did,
        body.indyNamespace ?? 'digicred:test',
      );
      return {
        success: true,
        message: 'DID imported successfully. You can now use it as issuerId for schemas.',
        did: result.did,
      };
    } catch (err: any) {
      this.logger.error(`POST /dids/import-seed failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(err.message ?? 'DID import failed');
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new DID',
    description: 'Supported methods: "indy" (registered on digicred:test), "key" (local), "peer" (local)',
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateDidDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException(
        'Your account has no SSI wallet. Please register a new account — the current account was created before the agent was running.',
      );
    }

    this.logger.log(`POST /dids - tenant: ${user.tenantId}, method: ${body.method}`);

    try {
      const didState = await this.didService.create(user.tenantId, body.method, body.keyType);
      return {
        success: true,
        message: 'DID created successfully',
        did: {
          did: didState.did,
          method: body.method,
          didDocument: (didState as any).didDocument,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      this.logger.error(`POST /dids failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(err.message ?? 'DID creation failed');
    }
  }
}
