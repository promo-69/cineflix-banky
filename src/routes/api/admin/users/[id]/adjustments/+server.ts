import { json } from '@sveltejs/kit';
import { LedgerService } from '$lib/server/services/LedgerService';
import type { RequestHandler } from './$types';
import { customAlphabet } from 'nanoid';

const generateReference = customAlphabet('0123456789', 12);

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const userId = parseInt(params.id);
		const body = await request.json();
		const { amount } = body;

		if (!amount || amount === 0) {
			return json({ success: false, error: 'Monto inválido' }, { status: 400 });
		}

		const reference = generateReference();
		const resultTx = await LedgerService.processAdminAdjustment(userId, amount, reference);

		return json({ success: true, data: resultTx.toJSON() });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 400 });
	}
};
