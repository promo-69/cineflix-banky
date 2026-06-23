import { DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { BaseModel } from './BaseModel';

export class MasterToken extends BaseModel {
	declare id: number;
	declare token: string;
	declare description: string | null;
}

MasterToken.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		token: { type: DataTypes.STRING, allowNull: false, unique: true },
		description: { type: DataTypes.STRING, allowNull: true },
	},
	{
		sequelize,
		modelName: 'MasterToken',
		tableName: 'master_tokens',
		createdAt: 'created_at',
		updatedAt: false,
	},
);
