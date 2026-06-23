import { json } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
	try {
		const userId = parseInt(params.id);
		const newApiKey = await AuthService.rotateApiKey(userId);
		return json({ success: true, data: { api_key: newApiKey } });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
};
