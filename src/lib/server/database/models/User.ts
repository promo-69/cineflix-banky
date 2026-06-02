import { DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { BaseModel } from './BaseModel';

export class User extends BaseModel {
	declare id: number;
	declare document_id: string;
	declare email: string;
	declare phone: string;
	declare account_number: string;
	declare password_hash: string;
	declare api_key: string | null;
	declare webhook_url: string | null;
	declare first_name: string | null;
	declare last_name: string | null;
	declare balance: number;
	declare readonly deleted_at: Date | null;
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		document_id: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false },
		phone: { type: DataTypes.STRING, allowNull: false },
		account_number: { type: DataTypes.STRING, allowNull: false },
		password_hash: { type: DataTypes.STRING, allowNull: false },
		api_key: { type: DataTypes.STRING, allowNull: true },
		webhook_url: { type: DataTypes.STRING, allowNull: true },
		first_name: { type: DataTypes.STRING, allowNull: true },
		last_name: { type: DataTypes.STRING, allowNull: true },
		balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
		deleted_at: { type: DataTypes.DATE, allowNull: true },
	},
	{
		sequelize,
		modelName: 'User',
		tableName: 'users',
		paranoid: true,
		createdAt: false,
		updatedAt: false,
		deletedAt: 'deleted_at',
	},
);
