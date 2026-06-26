import { json } from '@sveltejs/kit';
import { LedgerService } from '$lib/server/services/LedgerService';
import type { RequestHandler } from './$types';
import { customAlphabet } from 'nanoid';

const generateReference = customAlphabet('0123456789', 12);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const {
			source_user_id,
			type,
			amount,
			destination_document,
			destination_account,
			destination_phone,
			bank_code,
		} = body;

		if (!source_user_id) {
			return json({ success: false, error: 'Usuario de origen requerido' }, { status: 400 });
		}
		if (!amount || amount <= 0) {
			return json({ success: false, error: 'Monto inválido' }, { status: 400 });
		}

		const reference = 'ADM-' + generateReference();
		let resultTx;

		if (type === 'transfer') {
			if (!destination_document || !destination_account) {
				return json({ success: false, error: 'Datos de transferencia incompletos' }, { status: 400 });
			}
			resultTx = await LedgerService.processTransfer(
				source_user_id,
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
				source_user_id,
				destination_document,
				destination_phone,
				bank_code,
				amount,
				reference,
			);
		} else {
			return json({ success: false, error: 'Tipo de transacción no soportado' }, { status: 400 });
		}

		return json({ success: true, data: resultTx.toJSON() });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 400 });
	}
};
