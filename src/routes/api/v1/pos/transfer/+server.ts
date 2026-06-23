import { json } from '@sveltejs/kit';
import { MasterToken, Card, User } from '$lib/server/database/models';
import { LedgerService } from '$lib/server/services/LedgerService';
import type { RequestHandler } from './$types';
import { customAlphabet } from 'nanoid';

const generateReference = customAlphabet('0123456789', 12);

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 1. Authenticate Master Token
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json({ success: false, error: 'Token maestro faltante o inválido' }, { status: 401 });
		}

		const tokenString = authHeader.substring(7);
		const masterToken = await MasterToken.findOne({ where: { token: tokenString } });

		if (!masterToken) {
			return json({ success: false, error: 'Token maestro inválido o revocado' }, { status: 401 });
		}

		// 2. Parse Payload
		const body = await request.json();
		const { amount, destinationAccount, destinationDocument, sourceCard } = body;

		if (!amount || amount <= 0) {
			return json({ success: false, error: 'Monto inválido' }, { status: 400 });
		}
		if (!destinationAccount || !destinationDocument || !sourceCard) {
			return json({ success: false, error: 'Datos de transferencia incompletos' }, { status: 400 });
		}

		// 3. Find Source Card and User
		const card = await Card.findOne({ where: { card_number: sourceCard } });
		if (!card) {
			return json({ success: false, error: 'Tarjeta de origen no encontrada o inválida' }, { status: 404 });
		}

		const user = await User.findByPk(card.user_id);
		if (!user) {
			return json({ success: false, error: 'Usuario origen no encontrado' }, { status: 404 });
		}

		// 4. Process Transfer
		// Note: LedgerService.processTransfer handles checking if destination account belongs to Banky
		const reference = generateReference();
		const resultTx = await LedgerService.processTransfer(
			user.id,
			destinationDocument,
			destinationAccount,
			amount,
			reference
		);

		// 5. Return success
		return json({
			success: true,
			data: resultTx.toJSON(),
		});
	} catch (e: any) {
		const status = e.message === 'Token maestro inválido o revocado' ? 401 : 400;
		return json({ success: false, error: e.message || 'Error procesando la transferencia POS' }, { status });
	}
};
