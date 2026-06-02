import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const doc_prefix = data.get('doc_prefix')?.toString() || 'V';
    const doc_number = data.get('doc_number')?.toString();
    const cedula = doc_number ? `${doc_prefix}-${doc_number}` : '';
    const password = data.get('password')?.toString();

    if (!cedula || !password) {
      return fail(400, { error: 'Faltan datos requeridos' });
    }

    try {
      const { token } = await AuthService.authenticateUser(cedula, password);
      
      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 // 1 hour
      });

      throw redirect(303, '/dashboard');
    } catch (e: any) {
      if (isRedirect(e)) throw e;
      console.log(e);
      return fail(401, { error: e.message || 'Credenciales inválidas' });
    }
  }
};
