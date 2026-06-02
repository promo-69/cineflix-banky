'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('transactions', 'balance_before', {
			type: Sequelize.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('transactions', 'balance_before');
	},
};
