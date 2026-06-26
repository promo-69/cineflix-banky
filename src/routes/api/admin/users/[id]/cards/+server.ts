import { json } from '@sveltejs/kit';
import { Card } from '$lib/server/database/models';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const userId = parseInt(params.id);
		const body = await request.json();
		const { card_number, alias } = body;

		if (!card_number) return json({ success: false, error: 'Número de tarjeta requerido' }, { status: 400 });

		const card = await Card.create({
			user_id: userId,
			card_number,
			alias: alias || null,
		});

		return json({ success: true, data: card.toJSON() });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, url }) => {
	try {
		const cardId = url.searchParams.get('card_id');
		if (!cardId) return json({ success: false, error: 'card_id requerido' }, { status: 400 });

		const userId = parseInt(params.id);
		const card = await Card.findOne({ where: { id: cardId, user_id: userId } });

		if (!card) return json({ success: false, error: 'Tarjeta no encontrada' }, { status: 404 });

		await card.destroy();
		return json({ success: true, message: 'Tarjeta eliminada' });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
