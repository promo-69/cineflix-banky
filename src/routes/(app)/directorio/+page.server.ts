import { fail } from '@sveltejs/kit';
import { AccountDirectory, MobilePaymentDirectory } from '$lib/server/database/models';
import type { Actions, PageServerLoad } from './$types';
import { capitalizeName } from '$lib/server/utils/StringUtils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { accounts: [], mobilePayments: [] };
	const user_id = locals.user!.id;

	const accounts = await AccountDirectory.getAll({ where: { user_id }, raw: true });
	const mobilePayments = await MobilePaymentDirectory.getAll({ where: { user_id }, raw: true });

	return {
		accounts,
		mobilePayments,
	};
};

export const actions: Actions = {
	createAccount: async ({ request, locals }) => {
		const data = await request.formData();
		const alias = data.get('alias')?.toString();
		const bank_code = data.get('bank_code')?.toString();
		const account_number = data.get('account_number')?.toString();
		const doc_prefix = data.get('doc_prefix')?.toString() || 'V';
		const doc_number = data.get('doc_number')?.toString();
		const name = data.get('name')?.toString();

		if (!alias || !bank_code || !account_number || !doc_number || !name) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		const document_id = `${doc_prefix}-${doc_number}`;
		const formatted_name = capitalizeName(name);

		try {
			await AccountDirectory.createOne({
				user_id: locals.user!.id,
				alias,
				bank_code,
				account_number,
				document_id,
				name: formatted_name,
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Error al guardar el contacto' });
		}
	},

	updateAccount: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const alias = data.get('alias')?.toString();
		const bank_code = data.get('bank_code')?.toString();
		const account_number = data.get('account_number')?.toString();
		const doc_prefix = data.get('doc_prefix')?.toString() || 'V';
		const doc_number = data.get('doc_number')?.toString();
		const name = data.get('name')?.toString();

		if (!id || !alias || !bank_code || !account_number || !doc_number || !name) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		const document_id = `${doc_prefix}-${doc_number}`;
		const formatted_name = capitalizeName(name);

		try {
			await AccountDirectory.updateOne(
				{ alias, bank_code, account_number, document_id, name: formatted_name },
				{ where: { id: parseInt(id), user_id: locals.user!.id } },
			);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Error al actualizar el contacto' });
		}
	},

	deleteAccount: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { error: 'ID es requerido' });

		try {
			await AccountDirectory.deleteOne({ where: { id: parseInt(id), user_id: locals.user!.id } });
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Error al eliminar el contacto' });
		}
	},

	createMobile: async ({ request, locals }) => {
		const data = await request.formData();
		const alias = data.get('alias')?.toString();
		const bank_code = data.get('bank_code')?.toString();
		const phone_number = data.get('phone_number')?.toString();
		const doc_prefix = data.get('doc_prefix')?.toString() || 'V';
		const doc_number = data.get('doc_number')?.toString();
		const name = data.get('name')?.toString();

		if (!alias || !bank_code || !phone_number || !doc_number || !name) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		const document_id = `${doc_prefix}-${doc_number}`;
		const formatted_name = capitalizeName(name);

		try {
			await MobilePaymentDirectory.createOne({
				user_id: locals.user!.id,
				alias,
				bank_code,
				phone_number,
				document_id,
				name: formatted_name,
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Error al guardar el contacto' });
		}
	},

	updateMobile: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const alias = data.get('alias')?.toString();
		const bank_code = data.get('bank_code')?.toString();
		const phone_number = data.get('phone_number')?.toString();
		const doc_prefix = data.get('doc_prefix')?.toString() || 'V';
		const doc_number = data.get('doc_number')?.toString();
		const name = data.get('name')?.toString();

		if (!id || !alias || !bank_code || !phone_number || !doc_number || !name) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		const document_id = `${doc_prefix}-${doc_number}`;
		const formatted_name = capitalizeName(name);

		try {
			await MobilePaymentDirectory.updateOne(
				{ alias, bank_code, phone_number, document_id, name: formatted_name },
				{ where: { id: parseInt(id), user_id: locals.user!.id } },
			);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Error al actualizar el contacto' });
		}
	},

	deleteMobile: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { error: 'ID es requerido' });

		try {
			await MobilePaymentDirectory.deleteOne({ where: { id: parseInt(id), user_id: locals.user!.id } });
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Error al eliminar el contacto' });
		}
	},
};
