import { DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { BaseModel } from './BaseModel';
import { User } from './User';

export class MobilePaymentDirectory extends BaseModel {
	declare id: number;
	declare user_id: number;
	declare alias: string;
	declare bank_code: string;
	declare phone_number: string;
	declare document_id: string;
	declare name: string;
}

MobilePaymentDirectory.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'id',
			},
		},
		alias: { type: DataTypes.STRING, allowNull: false },
		bank_code: { type: DataTypes.STRING, allowNull: false },
		phone_number: { type: DataTypes.STRING, allowNull: false },
		document_id: { type: DataTypes.STRING, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
	},
	{
		sequelize,
		modelName: 'MobilePaymentDirectory',
		tableName: 'mobile_payment_directories',
		timestamps: true,
	},
);

User.hasMany(MobilePaymentDirectory, { foreignKey: 'user_id' });
MobilePaymentDirectory.belongsTo(User, { foreignKey: 'user_id' });
