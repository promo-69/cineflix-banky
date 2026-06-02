'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('transaction_transfers', 'destination_user_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: { model: 'users', key: 'id' },
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL',
		});

		await queryInterface.addColumn('transaction_mobile_payments', 'destination_user_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: { model: 'users', key: 'id' },
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('transaction_transfers', 'destination_user_id');
		await queryInterface.removeColumn('transaction_mobile_payments', 'destination_user_id');
	},
};
