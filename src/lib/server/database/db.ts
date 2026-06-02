import { env as privateEnv } from '$env/dynamic/private';
import { Sequelize } from 'sequelize';
import config from './config.json';

const env = process.env?.NODE_ENV || 'development';
const dbConfig = (config as any)[env];

declare global {
	var __SEQUELIZE_INSTANCE__: Sequelize | undefined;
}

let sequelize: Sequelize;

if (globalThis.__SEQUELIZE_INSTANCE__) sequelize = globalThis.__SEQUELIZE_INSTANCE__;
else {
	if (privateEnv.DATABASE_URL) sequelize = new Sequelize(privateEnv.DATABASE_URL, dbConfig);
	else sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

	globalThis.__SEQUELIZE_INSTANCE__ = sequelize;
}

export { sequelize };
