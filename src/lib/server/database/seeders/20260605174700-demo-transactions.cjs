'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const users = await queryInterface.sequelize.query(
			'SELECT id, document_id, account_number, balance FROM users;',
			{
				type: queryInterface.sequelize.QueryTypes.SELECT,
			},
		);

		if (users.length < 2) return;

		const user1 = users[0];
		const user2 = users[1];

		const reference = '489201928312';
		const amount = 50.0;

		await queryInterface.bulkInsert('transactions', [
			{
				user_id: user1.id,
				amount: -amount,
				type: 'transfer',
				balance_before: user1.balance,
				balance_after: user1.balance - amount,
				reference: reference,
				created_at: new Date(),
			},
			{
				user_id: user2.id,
				amount: amount,
				type: 'transfer',
				balance_before: user2.balance,
				balance_after: user2.balance + amount,
				reference: reference,
				created_at: new Date(),
			},
		]);

		const transactions = await queryInterface.sequelize.query(
			`SELECT id, user_id FROM transactions WHERE reference = '${reference}'`,
			{
				type: queryInterface.sequelize.QueryTypes.SELECT,
			},
		);

		const tx1 = transactions.find((t) => t.user_id === user1.id);
		const tx2 = transactions.find((t) => t.user_id === user2.id);

		if (tx1 && tx2) {
			await queryInterface.bulkInsert('transaction_transfers', [
				{
					transaction_id: tx1.id,
					destination_account: user2.account_number,
					destination_document: user2.document_id,
					destination_user_id: user2.id,
					created_at: new Date(),
				},
				{
					transaction_id: tx2.id,
					destination_account: user1.account_number,
					destination_document: user1.document_id,
					destination_user_id: user1.id,
					created_at: new Date(),
				},
			]);
		}

		// Update users balance
		await queryInterface.sequelize.query(`UPDATE users SET balance = balance - ${amount} WHERE id = ${user1.id}`);
		await queryInterface.sequelize.query(`UPDATE users SET balance = balance + ${amount} WHERE id = ${user2.id}`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('transaction_transfers', null, {});
		await queryInterface.bulkDelete('transactions', null, {});
	},
};
