import { json } from '@sveltejs/kit';
import { User } from '$lib/server/database/models';
import type { RequestHandler } from './$types';
import { Card, MasterToken } from '$lib/server/database/models';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const userId = parseInt(params.id);
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

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const userId = parseInt(params.id);
		const body = await request.json();
		const { first_name, last_name, email, phone, webhook_url } = body;

		const user = await User.findByPk(userId);
		if (!user) return json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });

		await user.update({
			first_name,
			last_name,
			email,
			phone,
			webhook_url: webhook_url || null,
		});

		return json({ success: true, data: user.toJSON() });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
