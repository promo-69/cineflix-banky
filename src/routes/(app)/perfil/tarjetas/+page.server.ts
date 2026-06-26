import type { Actions } from './$types';
import { Card } from '$lib/server/database/models';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	addCard: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'No autorizado' });
		const data = await request.formData();
		const card_number_raw = data.get('card_number')?.toString();
		const alias = data.get('alias')?.toString() || null;

		if (!card_number_raw) return fail(400, { error: 'Número de tarjeta es requerido' });

		const card_number = card_number_raw.toUpperCase();

		await Card.create({ user_id: locals.user.id, card_number, alias });
		return { success: true };
	},

	deleteCard: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'No autorizado' });
		const data = await request.formData();
		const card_id = data.get('card_id')?.toString();

		if (!card_id) return fail(400, { error: 'ID de tarjeta es requerido' });

		await Card.destroy({ where: { id: card_id, user_id: locals.user.id } });
		return { success: true };
	}
};
