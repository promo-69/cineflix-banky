import type { Actions } from './$types';
import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const data = await request.formData();
		const first_name = data.get('first_name')?.toString() || '';
		const last_name = data.get('last_name')?.toString() || '';
		const phone = data.get('phone')?.toString() || '';
		const email = data.get('email')?.toString() || '';

		if (locals.user?.id) {
			await AuthService.updateProfile(locals.user.id, first_name, last_name, phone, email);
			return { success: true };
		}
		return fail(401, { error: 'No autorizado' });
	},

	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		throw redirect(303, '/login');
	},
};
