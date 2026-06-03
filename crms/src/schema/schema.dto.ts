import { ApiProperty } from '@nestjs/swagger';

export class SchemaDTO{
  @ApiProperty()
  "name": string;

  @ApiProperty()
  "version": string;

  @ApiProperty()
  "attrNames": string[];

  @ApiProperty()
  "issuerId": string
}