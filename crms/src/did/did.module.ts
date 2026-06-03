import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { DidController } from './did.controller';
import { DidService } from './did.service';

@Module({
  imports: [AgentModule],
  controllers: [DidController],
  providers: [DidService],
  exports: [DidService],
})
export class DidModule {}
