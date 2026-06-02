'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const password_hash = await bcrypt.hash('Clave123*', 10);

		await queryInterface.bulkInsert(
			'users',
			[
				{
					document_id: 'V-12345678',
					email: 'test@example.com',
					phone: '04141234567',
					account_number: '01021234567890123456',
					password_hash,
					api_key: 'sk_test_key_123',
					webhook_url: null,
					first_name: 'Alirio',
					last_name: 'Perdomo',
					balance: 1000.0,
				},
				{
					document_id: 'V-87654321',
					email: 'test2@example.com',
					phone: '04249876543',
					account_number: '01029876543210987654',
					password_hash,
					api_key: 'sk_test_key_456',
					webhook_url: null,
					first_name: 'Miguel',
					last_name: 'Alvarez',
					balance: 2000.0,
				},
				{
					document_id: 'V-28019240',
					email: 'test2@example.com',
					phone: '04121502028',
					account_number: '01029280192400987654',
					password_hash,
					api_key: 'sk_test_key_456',
					webhook_url: null,
					first_name: 'Alirio',
					last_name: 'Freytez',
					balance: 10000.0,
				},
			],
			{},
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('users', null, {});
	},
};
