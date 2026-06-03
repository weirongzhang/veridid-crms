import type { JwtPayload } from '../auth/jwt-auth.guard';
import { SchemaService } from './schema.service';
import { SchemaDTO } from './schema.dto';
export declare class SchemaController {
    private readonly schemaService;
    private readonly logger;
    constructor(schemaService: SchemaService);
    getAvailableDids(user: JwtPayload): Promise<{
        dids: {
            did: any;
            type: any;
            createdAt: any;
        }[];
        didsByType: Record<string, {
            did: string;
            createdAt: Date;
        }[]>;
        success: boolean;
    }>;
    getBySchemaId(user: JwtPayload, schemaId: string): Promise<{
        success: boolean;
        schema: any;
    }>;
    getAll(user: JwtPayload): Promise<{
        success: boolean;
        schemas: any;
    }>;
    register(user: JwtPayload, body: SchemaDTO, SchemaDTO: any): Promise<{
        success: boolean;
        message: string;
        schemaId: any;
        schema: any;
    }>;
}
