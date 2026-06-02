import { DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Transaction } from './Transaction';
import { BaseModel } from './BaseModel';

export class TransactionTransfer extends BaseModel {
	declare transaction_id: number;
	declare destination_account: string;
	declare destination_document: string;
	declare destination_user_id: number | null;
	declare readonly created_at: Date;
	declare readonly deleted_at: Date | null;
}

TransactionTransfer.init(
	{
		transaction_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		destination_account: { type: DataTypes.STRING, allowNull: false },
		destination_document: { type: DataTypes.STRING, allowNull: false },
		destination_user_id: { type: DataTypes.INTEGER, allowNull: true },
		created_at: { type: DataTypes.DATE, allowNull: true },
		deleted_at: { type: DataTypes.DATE, allowNull: true },
	},
	{
		sequelize,
		modelName: 'TransactionTransfer',
		tableName: 'transaction_transfers',
		paranoid: true,
		createdAt: 'created_at',
		updatedAt: false,
		deletedAt: 'deleted_at',
	},
);

Transaction.hasOne(TransactionTransfer, { foreignKey: 'transaction_id' });
TransactionTransfer.belongsTo(Transaction, { foreignKey: 'transaction_id' });
