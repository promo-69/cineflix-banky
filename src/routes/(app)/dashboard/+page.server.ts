import type { PageServerLoad } from './$types';
import { User, Transaction } from '$lib/server/database/models';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await User.getById(locals.user?.id as number);
	const transactions = await Transaction.getAll({
		where: { user_id: locals.user?.id },
		order: [['created_at', 'DESC']],
		limit: 5,
	});

	return {
		user,
		transactions,
	};
};
