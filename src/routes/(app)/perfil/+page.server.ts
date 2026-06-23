import type { PageServerLoad, Actions } from './$types';
import { User, Card } from '$lib/server/database/models';
import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const user = await User.findByPk(locals.user?.id);
  const cards = await Card.findAll({ where: { user_id: locals.user?.id }, raw: true });
  return {
    user: user ? user.toJSON() : null,
    cards: cards
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

  addCard: async ({ request, locals }) => {
    if (!locals.user?.id) return fail(401, { error: 'No autorizado' });
    const data = await request.formData();
    const card_number_raw = data.get('card_number')?.toString();
    const alias = data.get('alias')?.toString() || null;

    if (!card_number_raw) return fail(400, { error: 'Número de tarjeta es requerido' });
    
    const card_number = card_number_raw.toUpperCase();

    await Card.create({ user_id: locals.user.id, card_number, alias });
    return { success: true };
  },

  deleteCard: async ({ request, locals }) => {
    if (!locals.user?.id) return fail(401, { error: 'No autorizado' });
    const data = await request.formData();
    const card_id = data.get('card_id')?.toString();

    if (!card_id) return fail(400, { error: 'ID de tarjeta es requerido' });

    await Card.destroy({ where: { id: card_id, user_id: locals.user.id } });
    return { success: true };
  },

  logout: async ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    throw redirect(303, '/login');
  }
};
