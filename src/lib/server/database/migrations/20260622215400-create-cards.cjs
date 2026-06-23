'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('cards', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			card_number: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			alias: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		});

		await queryInterface.addIndex('cards', ['user_id'], {
			name: 'cards_user_id_idx',
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('cards');
	},
};
