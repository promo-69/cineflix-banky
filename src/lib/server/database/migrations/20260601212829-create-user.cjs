'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			document_id: { type: Sequelize.STRING, allowNull: false },
			email: { type: Sequelize.STRING, allowNull: false },
			phone: { type: Sequelize.STRING, allowNull: false },
			account_number: { type: Sequelize.STRING, allowNull: false },
			password_hash: { type: Sequelize.STRING, allowNull: false },
			api_key: { type: Sequelize.STRING, allowNull: true },
			webhook_url: { type: Sequelize.STRING, allowNull: true },
			balance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			deleted_at: { type: Sequelize.DATE },
		});

		await queryInterface.addIndex('users', ['document_id'], {
			unique: true,
			where: { deleted_at: { [Sequelize.Op.ne]: null } },
			name: 'users_document_id_idx',
		});
		await queryInterface.addIndex('users', ['email'], {
			unique: true,
			where: { deleted_at: { [Sequelize.Op.ne]: null } },
			name: 'users_email_idx',
		});
		await queryInterface.addIndex('users', ['phone'], {
			unique: true,
			where: { deleted_at: { [Sequelize.Op.ne]: null } },
			name: 'users_phone_idx',
		});
		await queryInterface.addIndex('users', ['account_number'], {
			unique: true,
			where: { deleted_at: { [Sequelize.Op.ne]: null } },
			name: 'users_account_number_idx',
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('users');
	},
};
