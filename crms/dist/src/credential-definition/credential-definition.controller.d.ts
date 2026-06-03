import type { JwtPayload } from '../auth/jwt-auth.guard';
import { CredentialDefinitionService } from './credential-definition.service';
import { CreateCredentialDefinitionDto } from './credential-definition.dto';
export declare class CredentialDefinitionController {
    private readonly credDefService;
    private readonly logger;
    constructor(credDefService: CredentialDefinitionService);
    getById(user: JwtPayload, credDefId: string): Promise<{
        success: boolean;
        credentialDefinition: any;
        schemaId: any;
    }>;
    getAll(user: JwtPayload): Promise<{
        success: boolean;
        credentialDefinitions: any;
    }>;
    register(user: JwtPayload, body: CreateCredentialDefinitionDto): Promise<{
        success: boolean;
        message: string;
        credentialDefinitionId: any;
        credentialDefinition: any;
    }>;
}
