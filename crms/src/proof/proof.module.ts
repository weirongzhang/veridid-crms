import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { ProofController } from './proof.controller';
import { ProofService } from './proof.service';

@Module({
  imports: [AgentModule],
  controllers: [ProofController],
  providers: [ProofService],
})
export class ProofModule {}
