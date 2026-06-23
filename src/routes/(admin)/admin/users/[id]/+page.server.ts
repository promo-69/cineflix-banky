import type { PageServerLoad } from './$types';
import { User, Card, Transaction } from '$lib/server/database/models';
import { error } from '@sveltejs/kit';
import { Op } from 'sequelize';

export const load: PageServerLoad = async ({ params, url }) => {
	const userId = parseInt(params.id);
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 10;
	const offset = (page - 1) * limit;
	
	const user = await User.findByPk(userId);
	if (!user) throw error(404, 'Usuario no encontrado');

	const cards = await Card.findAll({ where: { user_id: userId } });

	const { count, rows: transactions } = await Transaction.findAndCountAll({
		where: { user_id: userId },
		order: [['created_at', 'DESC']],
		limit,
		offset
	});

	return {
		user: user.toJSON(),
		cards: cards.map(c => c.toJSON()),
		transactions: transactions.map(t => t.toJSON()),
		txTotal: count,
		txPage: page,
		txTotalPages: Math.ceil(count / limit)
	};
};
