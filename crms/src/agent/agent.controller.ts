import { Controller, Get, Logger } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

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
}
