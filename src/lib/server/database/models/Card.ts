import { DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { BaseModel } from './BaseModel';

export class Card extends BaseModel {
	declare id: number;
	declare user_id: number;
	declare card_number: string;
	declare alias: string | null;
	declare readonly deleted_at: Date | null;
}

Card.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: { type: DataTypes.INTEGER, allowNull: false },
		card_number: { type: DataTypes.STRING, allowNull: false },
		alias: { type: DataTypes.STRING, allowNull: true },
		deleted_at: { type: DataTypes.DATE, allowNull: true },
	},
	{
		sequelize,
		modelName: 'Card',
		tableName: 'cards',
		paranoid: true,
		createdAt: 'created_at',
		updatedAt: false,
		deletedAt: 'deleted_at',
	},
);
