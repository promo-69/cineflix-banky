import { json } from '@sveltejs/kit';
import { LedgerService } from '$lib/server/services/LedgerService';
import { Transaction } from '$lib/server/database/models';
import type { RequestHandler } from './$types';
import { customAlphabet } from 'nanoid';

const generateReference = customAlphabet('0123456789', 12);

export const GET: RequestHandler = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 10;
	const offset = (page - 1) * limit;

	const { count, rows: transactions } = await Transaction.findAndCountAll({
		where: { user_id: locals.user?.id },
		order: [['created_at', 'DESC']],
		limit,
		offset,
	});

	return json({
		success: true,
		data: transactions.map((t) => t.toJSON()),
		meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { type, amount, destination_document, destination_account, destination_phone, bank_code } = body;

		if (!amount || amount <= 0) {
			return json({ success: false, error: 'Monto inválido' }, { status: 400 });
		}

		const reference = generateReference();
		let resultTx;

		if (type === 'transfer') {
			if (!destination_document || !destination_account) {
				return json({ success: false, error: 'Datos de transferencia incompletos' }, { status: 400 });
			}
			resultTx = await LedgerService.processTransfer(
				locals.user!.id,
				destination_document,
				destination_account,
				amount,
				reference,
			);
		} else if (type === 'mobile_payment') {
			if (!destination_document || !destination_phone || !bank_code) {
				return json({ success: false, error: 'Datos de pago móvil incompletos' }, { status: 400 });
			}
			resultTx = await LedgerService.processMobilePayment(
				locals.user!.id,
				destination_document,
				destination_phone,
				bank_code,
				amount,
				reference,
			);
		} else {
			return json({ success: false, error: 'Tipo de transacción no soportado' }, { status: 400 });
		}

		return json({
			success: true,
			data: resultTx.toJSON(),
		});
	} catch (e: any) {
		return json({ success: false, error: e.message || 'Error procesando la transacción' }, { status: 400 });
	}
};
