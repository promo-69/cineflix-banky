import type { PageServerLoad } from './$types';
import { Transaction } from '$lib/server/database/models';

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 10;
	const offset = (page - 1) * limit;

	const { count, rows: transactions } = await Transaction.findAndCountAll({
		where: { user_id: locals.user?.id },
		order: [['created_at', 'DESC']],
		limit,
		offset,
	});

	return {
		transactions: transactions.map((t) => t.get({ plain: true })),
		pagination: {
			page,
			limit,
			total: count,
			totalPages: Math.ceil(count / limit),
		},
	};
};
