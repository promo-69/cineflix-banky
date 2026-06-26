import { json } from '@sveltejs/kit';
import { User } from '$lib/server/database/models';
import type { RequestHandler } from './$types';
import { Op } from 'sequelize';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const search = url.searchParams.get('q');
		const whereClause = search
			? {
					[Op.or]: [
						{ document_id: { [Op.like]: `%${search}%` } },
						{ first_name: { [Op.like]: `%${search}%` } },
						{ last_name: { [Op.like]: `%${search}%` } },
					],
				}
			: {};

		const page = Number(url.searchParams.get('page')) || 1;
		const limit = 10;
		const offset = (page - 1) * limit;

		const { count, rows: users } = await User.findAndCountAll({
			where: whereClause,
			order: [['id', 'DESC']],
			limit,
			offset,
			attributes: { exclude: ['password_hash'] },
		});

		return json({
			success: true,
			data: users.map((u) => u.toJSON()),
			meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
		});
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
