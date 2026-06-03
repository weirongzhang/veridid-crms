import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AgentModule } from './agent/agent.module';
import { ConnectionModule } from './connection/connection.module';
import { CredentialModule } from './credential/credential.module';
import { ProofModule } from './proof/proof.module';
import { SchemaModule } from './schema/schema.module';
import { CredentialDefinitionModule } from './credential-definition/credential-definition.module';
import { DidModule } from './did/did.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        entities: ['./dist/entities'],
        entitiesTs: ['./src/entities'],
        driver: PostgreSqlDriver,
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        dbName: config.get('POSTGRES_DB', 'crms'),
        user: config.get('POSTGRES_USER', 'postgres'),
        password: config.get('POSTGRES_PASSWORD', 'postgres'),
        autoLoadEntities: true,
        extensions: [Migrator],
        migrations: {
          path: 'dist/migrations',
          pathTs: 'src/migrations',
        },
      }),
    }),
    UserModule,
    AgentModule,
    ConnectionModule,
    CredentialModule,
    ProofModule,
    SchemaModule,
    CredentialDefinitionModule,
    DidModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
