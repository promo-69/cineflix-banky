import { DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Transaction } from './Transaction';
import { BaseModel } from './BaseModel';

export class TransactionMobilePayment extends BaseModel {
	declare transaction_id: number;
	declare destination_phone: string;
	declare destination_document: string;
	declare bank_code: string;
	declare destination_user_id: number | null;
	declare readonly created_at: Date;
	declare readonly deleted_at: Date | null;
}

TransactionMobilePayment.init(
	{
		transaction_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		destination_phone: { type: DataTypes.STRING, allowNull: false },
		destination_document: { type: DataTypes.STRING, allowNull: false },
		bank_code: { type: DataTypes.STRING, allowNull: false },
		destination_user_id: { type: DataTypes.INTEGER, allowNull: true },
		created_at: { type: DataTypes.DATE, allowNull: true },
		deleted_at: { type: DataTypes.DATE, allowNull: true },
	},
	{
		sequelize,
		modelName: 'TransactionMobilePayment',
		tableName: 'transaction_mobile_payments',
		paranoid: true,
		createdAt: 'created_at',
		updatedAt: false,
		deletedAt: 'deleted_at',
	},
);

Transaction.hasOne(TransactionMobilePayment, { foreignKey: 'transaction_id' });
TransactionMobilePayment.belongsTo(Transaction, { foreignKey: 'transaction_id' });
