import type { LayoutServerLoad } from './$types';
import { User, Card } from '$lib/server/database/models';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await User.findByPk(locals.user?.id);
	const cards = await Card.findAll({ where: { user_id: locals.user?.id }, raw: true });
	return {
		user: user ? user.toJSON() : null,
		cards: cards,
	};
};
