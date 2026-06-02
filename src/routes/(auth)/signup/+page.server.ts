import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    
    // We ignore first_name and last_name as per the database schema requirements for the MVP
    const document_id = data.get('document_id')?.toString() || '';
    const phone_prefix = data.get('phone_prefix')?.toString() || '';
    const phone_number = data.get('phone_number')?.toString() || '';
    const email = data.get('email')?.toString() || '';
    const password = data.get('password')?.toString() || '';

    const phone = `${phone_prefix}${phone_number}`;

    if (!document_id || !phone || !email || !password) {
      return fail(400, { error: 'Todos los campos son obligatorios' });
    }

    try {
      const { token } = await AuthService.registerUser(document_id, email, phone, password);
      
      // Set session cookie
      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 // 1 hour
      });

      throw redirect(303, '/dashboard');
    } catch (e: any) {
      if (isRedirect(e)) throw e;
      return fail(400, { error: e.message || 'Error al registrar el usuario' });
    }
  }
};
