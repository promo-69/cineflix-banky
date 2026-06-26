import type { Actions } from './$types';
import { AuthService } from '$lib/server/services/AuthService';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	rotateApiKey: async ({ locals }) => {
		if (locals.user?.id) {
			const newApiKey = await AuthService.rotateApiKey(locals.user.id);
			return { newApiKey };
		}
		return fail(401, { error: 'No autorizado' });
	},

	updateWebhook: async ({ request, locals }) => {
		const data = await request.formData();
		const webhookUrl = data.get('webhook_url')?.toString() || '';
		if (locals.user?.id) {
			await AuthService.updateWebhook(locals.user.id, webhookUrl);
			return { success: true };
		}
		return fail(401, { error: 'No autorizado' });
	}
};
