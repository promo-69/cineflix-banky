import type { PageServerLoad } from './$types';
import { User } from '$lib/server/database/models';
import { Op } from 'sequelize';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 10;
	const offset = (page - 1) * limit;

	const options: any = {
		order: [['id', 'DESC']],
		limit,
		offset,
	};

	if (search) {
		options.where = { document_id: { [Op.like]: `%${search}%` } };
	}

	const { count, rows: users } = await User.findAndCountAll(options);

	return {
		users: users.map((u) => u.toJSON()),
		total: count,
		page,
		totalPages: Math.ceil(count / limit),
	};
};
