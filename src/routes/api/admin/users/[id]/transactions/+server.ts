import { json } from '@sveltejs/kit';
import { Transaction } from '$lib/server/database/models';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const userId = parseInt(params.id);
		const page = Number(url.searchParams.get('page')) || 1;
		const limit = 10;
		const offset = (page - 1) * limit;

		const { count, rows: transactions } = await Transaction.findAndCountAll({
			where: { user_id: userId },
			order: [['created_at', 'DESC']],
			limit,
			offset,
		});

		return json({
			success: true,
			data: transactions.map((t) => t.toJSON()),
			meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
		});
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
