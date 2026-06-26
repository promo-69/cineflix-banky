import { json } from '@sveltejs/kit';
import { User, Card } from '$lib/server/database/models';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const userId = locals.user?.id;
		if (!userId) {
			return json({ success: false, error: 'No autenticado' }, { status: 401 });
		}

		const user = await User.findByPk(userId, {
			attributes: { exclude: ['password_hash'] },
		});

		if (!user) return json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });

		const cards = await Card.findAll({ where: { user_id: userId } });

		return json({
			success: true,
			data: {
				...user.toJSON(),
				cards: cards.map((c) => c.toJSON()),
			},
		});
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
