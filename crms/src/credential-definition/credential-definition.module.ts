import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { CredentialDefinitionController } from './credential-definition.controller';
import { CredentialDefinitionService } from './credential-definition.service';

@Module({
  imports: [AgentModule],
  controllers: [CredentialDefinitionController],
  providers: [CredentialDefinitionService],
  exports: [CredentialDefinitionService],
})
export class CredentialDefinitionModule {}
