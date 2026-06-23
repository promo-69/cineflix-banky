import { AppError } from '../utils/AppError';
import { sequelize } from '../database/db';
import { User, Transaction, TransactionTransfer, TransactionMobilePayment } from '../database/models';

export const LedgerService = {
	async processTransfer(
		sourceUserId: number,
		destinationDocument: string,
		destinationAccount: string,
		amount: number,
		reference: string,
	) {
		if (amount <= 0) throw new AppError('Monto inválido');

		return await sequelize.transaction(async (t) => {
			// 1. Lock sender
			const sender = await User.findByPk(sourceUserId, { transaction: t, lock: true });
			if (!sender) throw new AppError('Usuario origen no encontrado');

			// Get last transaction for strict balance checking
			const lastTxSender = await Transaction.findOne({
				where: { user_id: sender.id },
				order: [['id', 'DESC']],
				transaction: t,
				lock: true,
			});
			const senderBalanceBefore = lastTxSender ? Number(lastTxSender.balance_after) : Number(sender.balance);
			const newSenderBalance = senderBalanceBefore - amount;

			if (newSenderBalance < 0) throw new AppError('Saldo insuficiente');

			// 2. Lock receiver
			// Banky's internal bank code is '0201'
			if (!destinationAccount.startsWith('0201')) {
				throw new AppError('El destino no es válido');
			}

			const receiver = await User.findOne({
				where: { document_id: destinationDocument, account_number: destinationAccount },
				transaction: t,
				lock: true,
			});
			if (!receiver) throw new AppError('No se consiguió el destino');
			if (receiver.id === sender.id) throw new AppError('No puedes transferir a tu propia cuenta');

			// 3. Deduct from sender
			sender.balance = newSenderBalance; // sync UI cache
			await sender.save({ transaction: t });

			const txSender = await Transaction.create(
				{
					user_id: sender.id,
					amount: -amount,
					type: 'transfer',
					balance_before: senderBalanceBefore,
					balance_after: newSenderBalance,
					reference: reference,
				},
				{ transaction: t },
			);

			await TransactionTransfer.create(
				{
					transaction_id: txSender.id,
					destination_account: destinationAccount,
					destination_document: destinationDocument,
					destination_user_id: receiver.id,
				},
				{ transaction: t },
			);

			// 4. Add to receiver
			const lastTxReceiver = await Transaction.findOne({
				where: { user_id: receiver.id },
				order: [['id', 'DESC']],
				transaction: t,
				lock: true,
			});
			const receiverBalanceBefore = lastTxReceiver
				? Number(lastTxReceiver.balance_after)
				: Number(receiver.balance);
			const newReceiverBalance = receiverBalanceBefore + amount;

			receiver.balance = newReceiverBalance; // sync UI cache
			await receiver.save({ transaction: t });

			const txReceiver = await Transaction.create(
				{
					user_id: receiver.id,
					amount: amount,
					type: 'transfer',
					balance_before: receiverBalanceBefore,
					balance_after: newReceiverBalance,
					reference: reference,
				},
				{ transaction: t },
			);

			await TransactionTransfer.create(
				{
					transaction_id: txReceiver.id,
					destination_account: sender.account_number,
					destination_document: sender.document_id,
					destination_user_id: sender.id,
				},
				{ transaction: t },
			);

			// Webhook Síncrono (Fire-and-forget)
			if (receiver.webhook_url) {
				t.afterCommit(() => {
					fetch(receiver.webhook_url!, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ event: 'transfer_received', amount, reference }),
					}).catch(console.error);
				});
			}

			return txSender;
		});
	},

	async processMobilePayment(
		sourceUserId: number,
		destinationDocument: string,
		destinationPhone: string,
		bankCode: string,
		amount: number,
		reference: string,
	) {
		if (amount <= 0) throw new AppError('Monto inválido');

		return await sequelize.transaction(async (t) => {
			// 1. Lock sender
			const sender = await User.findByPk(sourceUserId, { transaction: t, lock: true });
			if (!sender) throw new AppError('Usuario origen no encontrado');

			const lastTxSender = await Transaction.findOne({
				where: { user_id: sender.id },
				order: [['id', 'DESC']],
				transaction: t,
				lock: true,
			});
			const senderBalanceBefore = lastTxSender ? Number(lastTxSender.balance_after) : Number(sender.balance);
			const newSenderBalance = senderBalanceBefore - amount;

			if (newSenderBalance < 0) throw new AppError('Saldo insuficiente');

			// 2. Validate external banks
			if (bankCode !== '0201') {
				throw new AppError('El destino no es válido');
			}

			// 3. Find receiver
			const receiver = await User.findOne({
				where: { document_id: destinationDocument, phone: destinationPhone },
				transaction: t,
				lock: true,
			});
			if (!receiver) {
				throw new AppError('No se consiguió el destino');
			}
			if (receiver.id === sender.id) {
				throw new AppError('No puedes realizar un pago móvil a tu propia cuenta');
			}

			// Deduct from sender
			sender.balance = newSenderBalance; // sync UI cache
			await sender.save({ transaction: t });

			const txSender = await Transaction.create(
				{
					user_id: sender.id,
					amount: -amount,
					type: 'mobile_payment',
					balance_before: senderBalanceBefore,
					balance_after: newSenderBalance,
					reference: reference,
				},
				{ transaction: t },
			);

			await TransactionMobilePayment.create(
				{
					transaction_id: txSender.id,
					destination_phone: destinationPhone,
					destination_document: destinationDocument,
					bank_code: bankCode,
					destination_user_id: receiver ? receiver.id : null,
				},
				{ transaction: t },
			);

			// If receiver is internal
			if (receiver) {
				const lastTxReceiver = await Transaction.findOne({
					where: { user_id: receiver.id },
					order: [['id', 'DESC']],
					transaction: t,
					lock: true,
				});
				const receiverBalanceBefore = lastTxReceiver
					? Number(lastTxReceiver.balance_after)
					: Number(receiver.balance);
				const newReceiverBalance = receiverBalanceBefore + amount;

				receiver.balance = newReceiverBalance; // sync UI cache
				await receiver.save({ transaction: t });

				const txReceiver = await Transaction.create(
					{
						user_id: receiver.id,
						amount: amount,
						type: 'mobile_payment',
						balance_before: receiverBalanceBefore,
						balance_after: newReceiverBalance,
						reference: reference,
					},
					{ transaction: t },
				);

				await TransactionMobilePayment.create(
					{
						transaction_id: txReceiver.id,
						destination_phone: sender.phone,
						destination_document: sender.document_id,
						bank_code: bankCode, // Using same bank code as it's internal
						destination_user_id: sender.id,
					},
					{ transaction: t },
				);

				if (receiver.webhook_url) {
					t.afterCommit(() => {
						fetch(receiver.webhook_url!, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ event: 'mobile_payment_received', amount, reference }),
						}).catch(console.error);
					});
				}
			}

			return txSender;
		});
	},

	async processAdminAdjustment(
		userId: number,
		amount: number,
		reference: string,
	) {
		if (amount === 0) throw new AppError('El monto no puede ser cero');

		return await sequelize.transaction(async (t) => {
			const targetUser = await User.findByPk(userId, { transaction: t, lock: true });
			if (!targetUser) throw new AppError('Usuario no encontrado');

			const lastTx = await Transaction.findOne({
				where: { user_id: targetUser.id },
				order: [['id', 'DESC']],
				transaction: t,
				lock: true,
			});
			const balanceBefore = lastTx ? Number(lastTx.balance_after) : Number(targetUser.balance);
			const newBalance = balanceBefore + amount;

			if (newBalance < 0) throw new AppError('El ajuste dejaría el saldo en negativo');

			targetUser.balance = newBalance;
			await targetUser.save({ transaction: t });

			const tx = await Transaction.create(
				{
					user_id: targetUser.id,
					amount: amount,
					type: 'admin_adjustment',
					balance_before: balanceBefore,
					balance_after: newBalance,
					reference: reference,
				},
				{ transaction: t },
			);

			return tx;
		});
	},
};
