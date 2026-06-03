"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260603171657 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260603171657 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table "user" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "password_hash" varchar(255) not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "role" text check ("role" in ('admin', 'user')) not null default 'user', "is_active" boolean not null default true, "tenant_id" varchar(255) null, "last_login_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "user_pkey" primary key ("id"));`);
        this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
        this.addSql(`create table "password_reset_token" ("id" uuid not null default gen_random_uuid(), "token" varchar(255) not null, "user_id" uuid not null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null, constraint "password_reset_token_pkey" primary key ("id"));`);
        this.addSql(`alter table "password_reset_token" add constraint "password_reset_token_token_unique" unique ("token");`);
        this.addSql(`alter table "password_reset_token" add constraint "password_reset_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    }
}
exports.Migration20260603171657 = Migration20260603171657;
//# sourceMappingURL=Migration20260603171657.js.map