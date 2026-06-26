import { fail, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		if (!username || !password) {
			return fail(400, { error: 'Usuario y contraseña requeridos' });
		}

		try {
			const { token } = await AuthService.authenticateSuperUser(username, password);

			cookies.set('admin_session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 8, // 8 horas
			});

			throw redirect(303, '/admin/dashboard');
		} catch (e: any) {
			if (e.status === 303) throw e;
			return fail(401, { error: e.message || 'Credenciales inválidas' });
		}
	},
};
