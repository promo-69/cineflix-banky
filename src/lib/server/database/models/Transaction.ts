import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';
import { BaseModel } from './BaseModel';

export class Transaction extends BaseModel {
	declare id: number;
	declare user_id: number;
	declare amount: number;
	declare type: string;
	declare balance_before: number;
	declare balance_after: number;
	declare reference: string;
	declare readonly created_at: Date;
	declare readonly deleted_at: Date | null;
}

Transaction.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: { type: DataTypes.INTEGER, allowNull: false },
		amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
		type: { type: DataTypes.STRING, allowNull: false },
		balance_before: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
		balance_after: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
		reference: { type: DataTypes.STRING, allowNull: false },
		created_at: { type: DataTypes.DATE, allowNull: true },
		deleted_at: { type: DataTypes.DATE, allowNull: true },
	},
	{
		sequelize,
		modelName: 'Transaction',
		tableName: 'transactions',
		paranoid: true,
		createdAt: 'created_at',
		updatedAt: false,
		deletedAt: 'deleted_at',
	},
);

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });
