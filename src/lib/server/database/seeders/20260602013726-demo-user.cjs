'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { customAlphabet } = require('nanoid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const password_hash = await bcrypt.hash('Clave123*', 10);
		const mine_hash = await bcrypt.hash('Pastor55..', 10);

		await queryInterface.bulkInsert(
			'users',
			[
				{
					document_id: 'V-12345678',
					email: 'alirio@example.com',
					phone: '04141234567',
					account_number: '02010100000101010101', //'0201' + generateNumericId(),
					password_hash,
					api_key: 'af4c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c', //nanoid(64),
					webhook_url: null,
					first_name: 'Alirio',
					last_name: 'Perdomo',
					balance: 1000.0,
				},
				{
					document_id: 'V-87654321',
					email: 'miguel@example.com',
					phone: '04249876543',
					account_number: '02011239123123123231', //'0201' + generateNumericId(),
					password_hash,
					api_key: '1234567890123456789012345678901234567890123456789012345678901234', //nanoid(64),
					webhook_url: null,
					first_name: 'Miguel',
					last_name: 'Alvarez',
					balance: 2000.0,
				},
				{
					document_id: 'V-28019240',
					email: 'freytez@example.com',
					phone: '04121502028',
					account_number: '02011231231231231233', //'0201' + generateNumericId(),
					password_hash: mine_hash,
					api_key: 'f2e4d6c8b0a2f4d6c8b0a2f4d6c8b0a2f4d6c8b0a2f4d6c8b0a2f4d6c8b0a2f4', //nanoid(64),
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
