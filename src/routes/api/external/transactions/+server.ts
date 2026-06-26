import { json } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import { LedgerService } from '$lib/server/services/LedgerService';
import type { RequestHandler } from './$types';
import { customAlphabet } from 'nanoid';

const generateReference = customAlphabet('0123456789', 12);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json({ success: false, error: 'Token de autenticación faltante o inválido' }, { status: 401 });
		}

		const token = authHeader.substring(7);
		const user = await AuthService.authenticateApiKey(token);

		const body = await request.json();
		const { type, amount, destinationDocument, destinationAccount, destinationPhone, bankCode } = body;

		if (!amount || amount <= 0) {
			return json({ success: false, error: 'Monto inválido' }, { status: 400 });
		}

		const reference = generateReference();
		let resultTx;

		if (type === 'transfer') {
			if (!destinationDocument || !destinationAccount) {
				return json({ success: false, error: 'Datos de transferencia incompletos' }, { status: 400 });
			}
			resultTx = await LedgerService.processTransfer(
				user.id,
				destinationDocument,
				destinationAccount,
				amount,
				reference,
			);
		} else if (type === 'mobile_payment') {
			if (!destinationDocument || !destinationPhone || !bankCode) {
				return json({ success: false, error: 'Datos de pago móvil incompletos' }, { status: 400 });
			}
			resultTx = await LedgerService.processMobilePayment(
				user.id,
				destinationDocument,
				destinationPhone,
				bankCode,
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
		const status = e.message === 'API Key inválida o no autorizada' ? 401 : 400;
		return json({ success: false, error: e.message || 'Error procesando la transacción' }, { status });
	}
};
