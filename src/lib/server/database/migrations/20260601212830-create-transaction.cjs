'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('transactions', {
			id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
			user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
			amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
			type: { type: Sequelize.STRING, allowNull: false },
			balance_after: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
			reference: { type: Sequelize.STRING, allowNull: false },
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			deleted_at: { type: Sequelize.DATE },
		});

		await queryInterface.addIndex('transactions', ['reference'], {
			unique: true,
			where: { deleted_at: { [Sequelize.Op.ne]: null } },
			name: 'transactions_reference_idx',
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('transactions');
	},
};
