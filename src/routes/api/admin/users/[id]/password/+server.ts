import { json } from '@sveltejs/kit';
import { User } from '$lib/server/database/models';
import bcrypt from 'bcrypt';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const userId = parseInt(params.id);
		const body = await request.json();
		const { new_password } = body;

		if (!new_password) return json({ success: false, error: 'La nueva contraseña es requerida' }, { status: 400 });

		const user = await User.findByPk(userId);
		if (!user) return json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });

		const password_hash = await bcrypt.hash(new_password, 10);
		await user.update({ password_hash });

		return json({ success: true, message: 'Contraseña actualizada' });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
