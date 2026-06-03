import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
//import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
//import { Entity, PrimaryKey, Property } from '@mikro-orm/postgresql';
//import { Entity, PrimaryKey, Property } from '@mikro-orm/nestjs';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.User;

  @Property()
  isActive: boolean = true;

  @Property({ nullable: true })
  tenantId?: string;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
