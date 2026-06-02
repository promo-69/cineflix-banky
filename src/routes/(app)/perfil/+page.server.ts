import type { PageServerLoad, Actions } from './$types';
import { User } from '$lib/server/database/models';
import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const user = await User.findByPk(locals.user?.id);
  return {
    user: user ? user.toJSON() : null
  };
};

export const actions: Actions = {
  updateWebhook: async ({ request, locals }) => {
    const data = await request.formData();
    const webhookUrl = data.get('webhook_url')?.toString() || '';
    if (locals.user?.id) {
      await AuthService.updateWebhook(locals.user.id, webhookUrl);
      return { success: true };
    }
    return fail(401, { error: 'No autorizado' });
  },

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
  
  rotateApiKey: async ({ locals }) => {
    if (locals.user?.id) {
      const newApiKey = await AuthService.rotateApiKey(locals.user.id);
      return { newApiKey };
    }
    return fail(401, { error: 'No autorizado' });
  },

  logout: async ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    throw redirect(303, '/login');
  }
};
