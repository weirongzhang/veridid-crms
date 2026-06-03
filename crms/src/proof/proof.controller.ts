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
import { ProofService } from './proof.service';

@ApiTags('Proofs')
@ApiBearerAuth()
@Controller('proofs')
export class ProofController {
  private readonly logger = new Logger(ProofController.name);

  constructor(private readonly proofService: ProofService) {}

  @Get()
  @ApiOperation({ summary: 'Get all proof exchange records' })
  async getAll(@CurrentUser() user: JwtPayload) {
    this.logger.log(`GET /proofs - tenant: ${user.tenantId}`);
    const proofs = await this.proofService.getAll(user.tenantId);
    return {
      success: true,
      proofs: proofs.map((p: any) => ({
        id: p.id,
        state: p.state,
        createdAt: p.createdAt,
        connectionId: p.connectionId,
        threadId: p.threadId,
        isVerified: p.isVerified,
      })),
    };
  }

  @Post('request')
  @ApiOperation({ summary: 'Send a proof request to a connection' })
  async requestProof(
    @CurrentUser() user: JwtPayload,
    @Body() body: { connectionId: string; proofAttributes: any; credentialDefinitionId?: string },
  ) {
    this.logger.log(`POST /proofs/request - tenant: ${user.tenantId}`);
    const proof = await this.proofService.requestProof(
      user.tenantId,
      body.connectionId,
      body.proofAttributes,
      body.credentialDefinitionId,
    );
    return {
      success: true,
      proof: {
        id: proof.id,
        state: proof.state,
        connectionId: proof.connectionId,
        threadId: (proof as any).threadId,
      },
    };
  }

  @Post(':proofId/accept')
  @ApiOperation({ summary: 'Accept a proof request by selecting matching credentials' })
  async acceptProof(
    @CurrentUser() user: JwtPayload,
    @Param('proofId') proofId: string,
    @Body() body: { selectedCredentials: any },
  ) {
    this.logger.log(`POST /proofs/${proofId}/accept - tenant: ${user.tenantId}`);
    const updated = await this.proofService.acceptProof(user.tenantId, proofId, body.selectedCredentials);
    if (!updated) {
      throw new NotFoundException(`Proof ${proofId} not found after accept`);
    }
    return {
      success: true,
      proof: {
        id: updated.id,
        state: updated.state,
        connectionId: updated.connectionId,
        threadId: (updated as any).threadId,
        isVerified: updated.isVerified,
      },
    };
  }

  @Get(':proofId')
  @ApiOperation({ summary: 'Get a proof exchange record by ID' })
  async getById(@CurrentUser() user: JwtPayload, @Param('proofId') proofId: string) {
    this.logger.log(`GET /proofs/${proofId} - tenant: ${user.tenantId}`);
    const proof = await this.proofService.getById(user.tenantId, proofId);
    if (!proof) {
      throw new NotFoundException(`Proof ${proofId} not found`);
    }
    return {
      success: true,
      proof: {
        id: proof.id,
        state: proof.state,
        createdAt: proof.createdAt,
        connectionId: proof.connectionId,
        threadId: (proof as any).threadId,
        isVerified: proof.isVerified,
      },
    };
  }
}
