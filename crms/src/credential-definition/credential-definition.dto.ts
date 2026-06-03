import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCredentialDefinitionDto {
  @ApiProperty({
    description: 'Full AnonCreds schema ID (e.g. did:indy:digicred:test:<issuerDID>/anoncreds/v0/SCHEMA/<name>/<version>)',
    example: 'did:indy:digicred:test:2WJ58wm9K8psQSDBW8VotA/anoncreds/v0/SCHEMA/MySchema/1.0',
  })
  schemaId: string;

  @ApiProperty({
    description: 'Tag to distinguish multiple credential definitions for the same schema',
    example: 'default',
  })
  tag: string;

  @ApiPropertyOptional({
    description: 'Whether to enable credential revocation support',
    default: false,
  })
  supportRevocation?: boolean;
}
