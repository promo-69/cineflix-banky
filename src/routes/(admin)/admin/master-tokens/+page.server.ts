import type { PageServerLoad, Actions } from './$types';
import { MasterToken } from '$lib/server/database/models';
import { error, fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';

import { sequelize } from '$lib/server/database/db';

// Function to generate a secure random token
const generateToken = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

export const load: PageServerLoad = async () => {
	const tokens = await MasterToken.findAll({
		order: [['created_at', 'DESC']],
	});

	return {
		tokens: tokens.map((t) => t.toJSON()),
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const description = data.get('description')?.toString().trim() || null;

		const tokenString = 'mt_' + generateToken();

		await MasterToken.create({
			token: tokenString,
			description,
		});

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) return fail(400, { error: 'ID is required' });

		await MasterToken.destroy({
			where: { id: parseInt(id.toString()) },
		});

		return { success: true };
	},
};
