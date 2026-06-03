"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const migrations_1 = require("@mikro-orm/migrations");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '.env') });
exports.default = (0, postgresql_1.defineConfig)({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    dbName: process.env.POSTGRES_DB ?? 'crms',
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    extensions: [migrations_1.Migrator],
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
    },
});
//# sourceMappingURL=mikro-orm.config.js.map