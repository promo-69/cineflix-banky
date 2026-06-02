'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('transaction_mobile_payments', {
			transaction_id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.INTEGER,
				references: { model: 'transactions', key: 'id' },
			},
			destination_phone: { type: Sequelize.STRING, allowNull: false },
			destination_document: { type: Sequelize.STRING, allowNull: false },
			bank_code: { type: Sequelize.STRING, allowNull: false },
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			deleted_at: { type: Sequelize.DATE },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('transaction_mobile_payments');
	},
};
