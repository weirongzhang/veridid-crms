# VeriDID CRMS — Technical Document

## Overview

VeriDID CRMS (Credential Management System) is a NestJS 11 backend that provides a REST API for managing self-sovereign identity (SSI) operations. Each registered user receives a dedicated Credo-TS agent tenant (wallet), enabling full isolation of DID, schema, credential, and proof operations between users. The API is served at `http://localhost:3000/api` with interactive Swagger documentation.

**Key capabilities**

- User registration and JWT-based authentication with refresh tokens
- Per-user isolated SSI wallets via Credo-TS multi-tenancy
- DID management (create, resolve) for `indy`, `key`, and `peer` methods
- AnonCreds schema and credential definition registration on an Indy ledger
- Verifiable credential issuance and proof request flows (DIDComm v2)
- Peer-to-peer DIDComm connections with OOB invitations

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser / App)                       │
│                    http://localhost:3000/api                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / REST + JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NestJS 11 Application  (:3000)                    │
│                                                                     │
│  Global JwtAuthGuard ──► @Public() routes bypass guard              │
│                                                                     │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │   Auth   │  │Connection │  │ Credential │  │     Proof       │  │
│  │Controller│  │Controller │  │Controller  │  │   Controller    │  │
│  └────┬─────┘  └─────┬─────┘  └─────┬──────┘  └────────┬────────┘  │
│       │              │               │                   │           │
│  ┌────▼─────┐  ┌─────▼─────┐  ┌─────▼──────┐  ┌────────▼────────┐  │
│  │  Auth    │  │Connection │  │ Credential │  │     Proof       │  │
│  │ Service  │  │  Service  │  │  Service   │  │    Service      │  │
│  └────┬─────┘  └─────┬─────┘  └─────┬──────┘  └────────┬────────┘  │
│       │              │               │                   │           │
│  ┌────▼──────────────▼───────────────▼───────────────────▼────────┐  │
│  │                       AgentService                              │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │                Credo-TS Main Agent (:3011)               │  │  │
│  │  │  TenantsModule → per-user TenantAgent (isolated wallet)  │  │  │
│  │  │  DidCommModule → DIDComm v2 (connections, credentials,   │  │  │
│  │  │                  proofs, OOB, basic messages)            │  │  │
│  │  │  IndyVdrModule → Indy ledger (DigiCred / von-network)    │  │  │
│  │  │  AnonCredsModule, DidsModule                             │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────┐  ┌────────────┐  ┌────────────┐                     │
│  │  Schema   │  │CredDef     │  │   DID      │                     │
│  │Controller │  │Controller  │  │ Controller │                     │
│  └───────────┘  └────────────┘  └────────────┘                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
               ┌───────────────┴────────────────┐
               │                                │
               ▼                                ▼
 ┌─────────────────────────┐     ┌──────────────────────────────┐
 │  PostgreSQL  (:5435)    │     │   Indy Ledger (von-network)  │
 │  DB: veridid-crms       │     │   Genesis: /genesis          │
 │  - user table           │     │   Nodes: :9701-9710          │
 │  - password_reset_token │     │   Browser: :9000             │
 │  - Askar wallet tables  │     └──────────────────────────────┘
 └─────────────────────────┘
```

---

## Entity Relationship Diagram

```
┌───────────────────────────────────────┐
│                 user                  │
├───────────────────────────────────────┤
│ id            UUID  PK  (gen_random_uuid()) │
│ email         VARCHAR  UNIQUE  NOT NULL     │
│ password_hash VARCHAR  NOT NULL             │
│ first_name    VARCHAR  nullable             │
│ last_name     VARCHAR  nullable             │
│ role          ENUM('admin','user')  DEFAULT 'user' │
│ is_active     BOOLEAN  DEFAULT true         │
│ tenant_id     VARCHAR  nullable  ◄── Credo tenant │
│ last_login_at TIMESTAMPTZ  nullable         │
│ created_at    TIMESTAMPTZ  DEFAULT now()    │
│ updated_at    TIMESTAMPTZ  DEFAULT now()    │
└───────────────────┬───────────────────┘
                    │ 1
                    │ N
┌───────────────────▼───────────────────┐
│         password_reset_token          │
├───────────────────────────────────────┤
│ id         UUID  PK  (gen_random_uuid()) │
│ token      VARCHAR  UNIQUE  NOT NULL     │
│ user_id    UUID  FK → user.id            │
│ expires_at TIMESTAMPTZ  NOT NULL         │
│ used_at    TIMESTAMPTZ  nullable         │
│ created_at TIMESTAMPTZ  DEFAULT now()    │
└───────────────────────────────────────┘

Note: Credo-TS wallet data (connections, credentials, proofs, DIDs,
schemas, credential definitions) is stored in Askar-managed tables
within the same PostgreSQL database, one database per tenant wallet
(AskarMultiWalletDatabaseScheme.DatabasePerWallet).
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20+ |
| Framework | NestJS | 11 |
| Language | TypeScript | 5 (strict, ES2023) |
| SSI Agent | Credo-TS (`@credo-ts/core`) | **0.6.3** |
| DIDComm | `@credo-ts/didcomm` | **0.6.3** |
| Multi-tenancy | `@credo-ts/tenants` | **0.6.3** |
| Wallet storage | `@credo-ts/askar` + `@openwallet-foundation/askar-nodejs` | **0.6.3 / 0.6.0** |
| Ledger client | `@credo-ts/indy-vdr` + `@hyperledger/indy-vdr-nodejs` | **0.6.3 / 0.3.0** |
| Credential format | AnonCreds (`@credo-ts/anoncreds` + `@hyperledger/anoncreds-nodejs`) | **0.6.3 / 0.4.0** |
| ORM | MikroORM | 6 |
| Database | PostgreSQL | 15+ |
| Authentication | JWT (access 15 m · refresh 7 d) | `@nestjs/jwt` |
| Password hashing | bcrypt (10 rounds) | `bcrypt` |
| Cookie handling | `cookie-parser` | — |
| API docs | Swagger / OpenAPI (`@nestjs/swagger`) | — |
| Local Indy ledger | von-network | Docker |

---

## Credo-TS 0.6 Module Architecture

In Credo-TS 0.6, all DIDComm functionality was extracted from `@credo-ts/core` into a dedicated `@credo-ts/didcomm` package. The agent configuration changed significantly:

### Agent Modules (0.6)

```typescript
new Agent({
  config: {},                          // label/endpoints/walletConfig removed
  dependencies: agentDependencies,
  modules: {
    askar: new AskarModule({           // wallet config moved here
      askar: askarNodeJS,              // from @openwallet-foundation/askar-nodejs
      multiWalletDatabaseScheme: AskarMultiWalletDatabaseScheme.DatabasePerWallet,
      store: { id, key, database: postgresStorage },
    }),
    dids: new DidsModule({ ... }),
    didcomm: new DidCommModule({       // new: replaces ConnectionsModule etc.
      endpoints: [agentEndpoint],      // endpoints moved here from InitConfig
      connections: { autoAcceptConnections: true },
      credentials: { autoAcceptCredentials, credentialProtocols },
      proofs: { autoAcceptProofs, proofProtocols },
    }),
    indyVdr: new IndyVdrModule({ ... }),
    anoncreds: new AnonCredsModule({ ... }),
    cache: new CacheModule({           // required when TenantsModule is active
      cache: new InMemoryLruCache({ limit: 500 }),
    }),
    tenants: new TenantsModule({ ... }),
  },
})
```

> **Why `CacheModule` is required with multi-tenancy:** Credo's default `SingleContextStorageLruCache` is scoped to a single agent context. `TenantsModule` creates a new context per tenant, causing every tenant-scoped operation to throw `"SingleContextStorageLruCache can not be used with multiple agent context instances"`. `InMemoryLruCache` lives at the process level and is safely shared across all contexts.

### Key 0.5 → 0.6 API Changes

| 0.5 | 0.6 | Notes |
|---|---|---|
| `agent.connections` | `agent.didcomm.connections` | All DIDComm sub-APIs under `.didcomm` |
| `agent.credentials` | `agent.didcomm.credentials` | — |
| `agent.proofs` | `agent.didcomm.proofs` | — |
| `agent.oob` | `agent.didcomm.oob` | — |
| `agent.basicMessages` | `agent.didcomm.basicMessages` | — |
| `agent.registerInboundTransport()` | `agent.didcomm.registerInboundTransport()` | — |
| `ConnectionsModule` | nested in `DidCommModule` | — |
| `CredentialsModule` | nested in `DidCommModule` | — |
| `ProofsModule` | nested in `DidCommModule` | — |
| `AutoAcceptCredential` (core) | `DidCommAutoAcceptCredential` (didcomm) | — |
| `AutoAcceptProof` (core) | `DidCommAutoAcceptProof` (didcomm) | — |
| `V2CredentialProtocol` | `DidCommCredentialV2Protocol` | — |
| `V2ProofProtocol` | `DidCommProofV2Protocol` | — |
| `AnonCredsCredentialFormatService` | `AnonCredsDidCommCredentialFormatService` | — |
| `AnonCredsProofFormatService` | `AnonCredsDidCommProofFormatService` | — |
| `HttpInboundTransport` (node) | `DidCommHttpInboundTransport` (node) | — |
| `HttpOutboundTransport` (core) | `DidCommHttpOutboundTransport` (didcomm) | — |
| `WsOutboundTransport` (core) | `DidCommWsOutboundTransport` (didcomm) | — |
| `ariesAskarNodeJS` (hyperledger) | `askarNodeJS` (openwallet-foundation) | Package renamed |
| `AskarWalletPostgresStorageConfig` | `AskarPostgresStorageConfig` | — |
| `proofRecordId` param | `proofExchangeRecordId` param | In proof API methods |
| `options: { keyType: KeyType.Ed25519 }` | `options: { createKey: { kty: 'OKP', crv: 'Ed25519' } }` | KMS-based key creation |
| `InitConfig.label` | removed | Not in 0.6 InitConfig |
| `InitConfig.endpoints` | removed | Moved to `DidCommModule` |
| `InitConfig.walletConfig` | removed | Moved to `AskarModule.store` |

---

## Database Layer

### Connection

```
Host:     localhost
Port:     5435
Database: veridid-crms
User:     postgres
```

Configured via environment variables in `.env`:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5435
POSTGRES_DB=veridid-crms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
```

### Schema management

MikroORM does not auto-create tables. Run once after initial setup or entity changes:

```bash
cd crms
./node_modules/.bin/mikro-orm schema:create --run
```

### Entities

#### `user`

Stores application accounts. The `tenant_id` column links each user to their isolated Credo-TS wallet.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `email` | VARCHAR | Unique, login identifier |
| `password_hash` | VARCHAR | bcrypt hash |
| `first_name` | VARCHAR | Optional |
| `last_name` | VARCHAR | Optional |
| `role` | ENUM | `admin` \| `user` |
| `is_active` | BOOLEAN | Default `true` |
| `tenant_id` | VARCHAR | Credo-TS tenant wallet ID |
| `last_login_at` | TIMESTAMPTZ | Updated on each login |
| `created_at` | TIMESTAMPTZ | Immutable |
| `updated_at` | TIMESTAMPTZ | Auto-updated on write |

#### `password_reset_token`

One-time tokens for the forgot-password flow. Tokens expire after 1 hour and are marked `used_at` after redemption.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `token` | VARCHAR | Unique, random hex string |
| `user_id` | UUID | FK → `user.id` |
| `expires_at` | TIMESTAMPTZ | now + 1 hour |
| `used_at` | TIMESTAMPTZ | Set on successful reset |
| `created_at` | TIMESTAMPTZ | Immutable |

### Askar wallet tables

Credo-TS creates and manages its own tables inside the same PostgreSQL database under the `AskarMultiWalletDatabaseScheme.DatabasePerWallet` scheme. Each tenant gets its own database. These tables are not managed by MikroORM migrations.

---

## Backend API Layer

### Authentication model

- **Access token** — JWT, 15-minute lifetime, returned in the response body. Include as `Authorization: Bearer <token>` on all protected endpoints.
- **Refresh token** — JWT, 7-day lifetime, stored as an `httpOnly; SameSite=Lax` cookie named `refreshToken`. Rotated on every `/auth/refresh` call.
- **Global guard** — `JwtAuthGuard` is registered via `APP_GUARD` and protects every route by default. Routes decorated with `@Public()` bypass the guard.

### JWT payload

```json
{
  "sub": "<user.id>",
  "email": "<user.email>",
  "tenantId": "<user.tenantId>"
}
```

The `tenantId` embedded in the token is forwarded automatically to the Credo-TS `TenantsModule` for every SSI operation, so callers never need to pass it explicitly.

---

### Endpoints

Base URL: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api`

#### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user; creates a Credo tenant; returns access token + sets refresh cookie |
| POST | `/auth/login` | Public | Authenticate with email/password; returns access token + rotates refresh cookie |
| GET | `/auth/verify` | Bearer | Validate the current access token; returns decoded payload |
| POST | `/auth/refresh` | Public (cookie) | Rotate tokens using the `refreshToken` cookie |
| POST | `/auth/logout` | Public | Clear the `refreshToken` cookie |
| POST | `/auth/forgot-password` | Public | Trigger a reset token (anti-enumeration: always returns success) |
| POST | `/auth/reset-password` | Public | Consume a reset token and set a new password |
| POST | `/auth/validate-reset-token` | Public | Check whether a reset token is still valid |

**Register request body**

```json
{
  "email": "alice@example.com",
  "password": "hunter2",
  "firstName": "Alice",
  "lastName": "Smith"
}
```

**Register response**

```json
{
  "success": true,
  "message": "Registration successful",
  "accessToken": "<jwt>",
  "user": {
    "id": "<uuid>",
    "email": "alice@example.com",
    "tenantId": "<credo-tenant-id>",
    "role": "user"
  }
}
```

---

#### Connections — `/connections`

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/connections` | List all connections and pending invitations |
| GET | `/connections/:connectionId` | Get a single connection record |
| GET | `/connections/messages/:connectionId` | Retrieve basic messages for a connection |
| POST | `/connections/invitation` | Create a new OOB invitation URL |
| POST | `/connections/receive-invitation` | Accept an invitation URL and establish a connection |
| POST | `/connections/message` | Send a basic DIDComm message to a connected peer |

**Create invitation response**

```json
{
  "success": true,
  "invitation": {
    "invitationUrl": "http://localhost:3011?oob=...",
    "outOfBandRecord": { "..." : "..." }
  }
}
```

---

#### Credentials — `/credentials`

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/credentials` | List all credential exchange records |
| GET | `/credentials/:credentialId` | Get a credential exchange record by ID |
| POST | `/credentials/issue` | Issue an AnonCreds credential to a connection |

**Issue credential request**

```json
{
  "connectionId": "<connection-uuid>",
  "credentialDefinitionId": "did:indy:digicred:test:...",
  "attributes": {
    "name": "Alice Smith",
    "dob": "1990-01-01"
  }
}
```

---

#### Proofs — `/proofs`

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/proofs` | List all proof exchange records |
| GET | `/proofs/:proofId` | Get a single proof record |
| POST | `/proofs/request` | Send a proof request to a connection |
| POST | `/proofs/:proofId/accept` | Accept a received proof request |

**Request proof body**

```json
{
  "connectionId": "<connection-uuid>",
  "credentialDefinitionId": "did:indy:digicred:test:...",
  "proofAttributes": {
    "name": { "name": "name", "restrictions": [] }
  }
}
```

---

#### Schemas — `/schemas`

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/schemas` | List all schemas created by this tenant |
| GET | `/schemas/available-dids` | List DIDs available for schema issuance |
| GET | `/schemas/by-id?schemaId=...` | Fetch a schema from the ledger by full schema ID |
| POST | `/schemas` | Register a new AnonCreds schema on the ledger |

**Register schema body**

```json
{
  "name": "EmployeeCredential",
  "version": "1.0",
  "attrNames": ["name", "dob", "department"],
  "issuerId": "did:indy:digicred:test:..."
}
```

---

#### Credential Definitions — `/credential-definitions`

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/credential-definitions` | List all credential definitions created by this tenant |
| GET | `/credential-definitions/by-id?credDefId=...` | Fetch a credential definition from the ledger |
| POST | `/credential-definitions` | Register a new AnonCreds credential definition |

**Register credential definition body**

```json
{
  "schemaId": "did:indy:digicred:test:.../anoncreds/v0/SCHEMA/EmployeeCredential/1.0",
  "tag": "default",
  "supportRevocation": false
}
```

---

#### DIDs — `/dids`

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/dids` | List all DIDs created by this tenant |
| GET | `/dids/resolve/:did` | Resolve any DID document (URL-encoded DID) |
| POST | `/dids` | Create a new DID (`indy`, `key`, or `peer`) |
| POST | `/dids/import-seed` | Import an existing Indy DID from a seed + verkey |

**Create DID body**

```json
{
  "method": "key",
  "keyType": "ed25519"
}
```

Supported methods: `indy` (registered on the Indy ledger), `key` (local, no ledger — Ed25519 or P-256), `peer` (local, DIDComm peer).

**Import DID from seed body**

```json
{
  "seed": "12345678901234567890123456789028",
  "verkey": "CJFQov22XwHpTSxWHHo5As6Uy2XfgHi43JaAQuNJDzho",
  "did": "MjDWrAigEsSwdEod69bCHV",
  "indyNamespace": "did:indy:bcovrin:test"
}
```

Key types in 0.6 are expressed as KMS JWK parameters internally:
- `ed25519` → `{ kty: 'OKP', crv: 'Ed25519' }`
- `p256` → `{ kty: 'EC', crv: 'P-256' }`

---

#### Agent — `/agent`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/agent/connections` | Bearer | List all connections visible to the main agent |
| GET | `/agent/oob-invitation` | Bearer | Generate an OOB invitation URL from the main agent |
| GET | `/agent/test` | Bearer | Health/smoke test |

---

## Workflows

### 1. Register and receive access token

```
Client                              CRMS API
  │                                    │
  │── POST /auth/register ────────────►│
  │   { email, password, firstName }   │
  │                                    │── agentService.createTenant(email)
  │                                    │   (Credo: creates isolated wallet)
  │                                    │── em.create(User, { tenantId, ... })
  │                                    │── bcrypt.hash(password, 10)
  │                                    │── jwtService.sign({ sub, email, tenantId })
  │◄── 201 { accessToken, user } ──────│
  │    Set-Cookie: refreshToken (httpOnly, 7d)
```

### 2. Authenticated request flow

```
Client                              CRMS API
  │                                    │
  │── GET /connections ───────────────►│
  │   Authorization: Bearer <jwt>      │
  │                                    │── JwtAuthGuard.canActivate()
  │                                    │   jwtService.verify(token)
  │                                    │   → payload { sub, email, tenantId }
  │                                    │── agentService.getAgent(tenantId)
  │                                    │   (TenantsModule.getTenantAgent)
  │                                    │── tenantAgent.didcomm.connections.getAll()
  │◄── 200 { success, connections } ───│
```

### 3. Token refresh

```
Client                              CRMS API
  │                                    │
  │── POST /auth/refresh ─────────────►│
  │   Cookie: refreshToken=<jwt>       │
  │                                    │── jwtService.verify(refreshToken)
  │                                    │── jwtService.sign(new access token)
  │                                    │── jwtService.sign(new refresh token)
  │◄── 200 { accessToken } ────────────│
  │    Set-Cookie: refreshToken (rotated, httpOnly, 7d)
```

### 4. Issue a verifiable credential end-to-end

```
Issuer (User A)                     CRMS API                  Holder (User B / external agent)
  │                                    │                              │
  │─ POST /schemas ───────────────────►│                              │
  │  Register schema on Indy ledger    │                              │
  │◄── { schemaId } ──────────────────│                              │
  │                                    │                              │
  │─ POST /credential-definitions ────►│                              │
  │  Register cred def for schema      │                              │
  │◄── { credentialDefinitionId } ────│                              │
  │                                    │                              │
  │─ POST /connections/invitation ────►│                              │
  │◄── { invitationUrl } ─────────────│                              │
  │                                    │                              │
  │── share invitationUrl ─────────────────────────────────────────►│
  │                                    │◄── OOB receive + DIDComm ───│
  │                                    │    connectionRecord.state    │
  │                                    │    → "completed"             │
  │                                    │                              │
  │─ POST /credentials/issue ─────────►│                              │
  │  { connectionId, credDefId, attrs }│                              │
  │                                    │── DidCommCredentialV2Protocol►│
  │◄── { credential.state } ──────────│    AnonCreds offer/request   │
  │                                    │    → state: "done"           │
```

### 5. Request and verify a proof

```
Verifier (User A)                   CRMS API                  Prover (User B)
  │                                    │                           │
  │─ POST /proofs/request ────────────►│                           │
  │  { connectionId, proofAttributes } │                           │
  │                                    │── DidCommProofV2Protocol ►│
  │                                    │   request-proof message    │
  │◄── { proof.state: "request-sent" }│                           │
  │                                    │◄── proof presentation ────│
  │                                    │   proof.state → "done"    │
  │                                    │   proof.isVerified → true │
  │─ GET /proofs/:proofId ────────────►│                           │
  │◄── { isVerified: true } ──────────│                           │
```

### 6. Password reset flow

```
Client                              CRMS API
  │                                    │
  │── POST /auth/forgot-password ─────►│
  │   { email }                        │
  │                                    │── lookup user by email
  │                                    │── create PasswordResetToken (1h TTL)
  │                                    │── [send email — not yet implemented]
  │◄── 200 { "If that email exists…" }│   (anti-enumeration: always 200)
  │                                    │
  │── POST /auth/validate-reset-token ►│
  │   { token }                        │
  │◄── { valid: true } ───────────────│
  │                                    │
  │── POST /auth/reset-password ──────►│
  │   { token, newPassword }           │
  │                                    │── verify token not expired / not used
  │                                    │── bcrypt.hash(newPassword)
  │                                    │── user.passwordHash = hash
  │                                    │── token.usedAt = now()
  │◄── 200 { "Password reset" } ──────│
```

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port for the NestJS app |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DB` | `crms` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | `jwt-secret` | Secret for signing JWTs |
| `AGENT_WALLET_ID` | `agent-wallet` | Credo main agent wallet ID |
| `AGENT_WALLET_KEY` | `agent-wallet-key` | Credo main agent wallet key |
| `AGENT_LABEL` | `crms-agent` | Credo agent display label (logged only) |
| `AGENT_ENDPOINT` | `http://localhost:3011` | DIDComm inbound endpoint (set in DidCommModule) |
| `AGENT_HTTP_PORT` | `3011` | DIDComm HTTP inbound port |
| `AGENT_SESSION_TIMEOUT` | `5000` | Tenant session acquire timeout (ms) |
| `GENESIS_URL` | DigiCred URL | URL to fetch genesis transactions |
| `GENESIS_TRANSACTIONS` | — | Raw genesis text (overrides URL) |
| `GENESIS_TRANSACTIONS_PATH` | — | Local file path to genesis (overrides URL) |
| `INDY_NAMESPACE` | `digicred:test` | Indy namespace for DID registration |

**Local development `.env` (von-network)**

```
POSTGRES_PORT=5435
POSTGRES_DB=veridid-crms
POSTGRES_PASSWORD=MyStrongPassword
GENESIS_URL=http://localhost:9000/genesis
INDY_NAMESPACE=localhost:test
```

---

## Local von-network

A local Indy ledger is provided via Docker Compose at `von-network/docker-compose.local.yml`.

```bash
# Start the ledger
cd /home/rong/VeriDID/von-network
docker compose -f docker-compose.local.yml up -d

# Verify
curl http://localhost:9000/genesis   # should return genesis transactions
```

The `nodes` container runs all 5 validator nodes via `start_nodes.sh` (supervisord). The `webserver` container exposes the ledger browser and genesis endpoint on port 9000.

---

## Running the Application

```bash
cd crms

# Install dependencies
yarn install

# Create database tables (first time only)
./node_modules/.bin/mikro-orm schema:create --run

# Start in watch mode
yarn start:dev

# Build for production
yarn build

# API available at:
#   http://localhost:3000/api   (Swagger UI)
#   http://localhost:3011       (Credo DIDComm inbound)
```
