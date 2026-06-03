import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDidDto {
  @ApiProperty({
    description: 'DID method to use',
    enum: ['indy', 'key', 'peer'],
    example: 'indy',
  })
  method: 'indy' | 'key' | 'peer';

  @ApiPropertyOptional({
    description: 'Key type for did:key (ignored for indy/peer)',
    enum: ['ed25519', 'p256'],
    example: 'ed25519',
  })
  keyType?: string;
}

export class ImportSeedDidDto {
  @ApiProperty({
    description: '32-byte seed used to register the DID on the ledger',
    example: '12345678901234567890123456789028',
  })
  seed: string;

  @ApiProperty({
    description: 'Base58 verkey shown on the genesis registration page',
    example: 'CJFQov22XwHpTSxWHHo5As6Uy2XfgHi43JaAQuNJDzho',
  })
  verkey: string;

  @ApiProperty({
    description: 'Short (unqualified) DID shown on the genesis registration page',
    example: 'MjDWrAigEsSwdEod69bCHV',
  })
  did: string;

  @ApiPropertyOptional({
    description: 'Indy namespace of the ledger (default: digicred:test)',
    example: 'digicred:test',
  })
  indyNamespace?: string;
}
