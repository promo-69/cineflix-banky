import { fail, redirect } from '@sveltejs/kit';
import { LedgerService } from '$lib/server/services/LedgerService';
import { User, AccountDirectory, MobilePaymentDirectory } from '$lib/server/database/models';
import type { Actions, PageServerLoad } from './$types';
import { customAlphabet } from 'nanoid';
import { AppError } from '$lib/server/utils/AppError';

const generateNumericReference = customAlphabet('0123456789', 20);

export const load: PageServerLoad = async ({ locals, url }) => {
	const sessionUser = locals.user;
	if (!sessionUser) throw redirect(303, '/login');

	const user = await User.findByPk(sessionUser.id);
	if (!user) throw redirect(303, '/login');

	const balance = Number(user.balance || 0);
	
	const accounts = await AccountDirectory.getAll({ where: { user_id: user.id }, raw: true });
	const mobilePayments = await MobilePaymentDirectory.getAll({ where: { user_id: user.id }, raw: true });

	const tab = url.searchParams.get('tab');

	return {
		user: {
			first_name: user.first_name,
			last_name: user.last_name,
			document_id: user.document_id,
			account_number: user.account_number,
		},
		balance,
		accounts,
		mobilePayments,
		tab,
	};
};

export const actions: Actions = {
	transfer: async ({ request, locals }) => {
		const data = await request.formData();
		let destinationDocument = data.get('destination_document')?.toString();
		if (!destinationDocument) {
			const docPrefix = data.get('doc_prefix')?.toString() || 'V';
			const docNumber = data.get('doc_number')?.toString();
			if (docNumber) destinationDocument = `${docPrefix}-${docNumber}`;
		}
		const destinationAccount = data.get('destination_account')?.toString();
		const amountStr = data.get('amount')?.toString();
		const amount = Number(amountStr);

		if (!destinationDocument || !destinationAccount || !amount || amount <= 0) {
			return fail(400, { error: 'Datos de transferencia inválidos' });
		}

		try {
			const reference = generateNumericReference();
			await LedgerService.processTransfer(
				locals.user!.id,
				destinationDocument,
				destinationAccount,
				amount,
				reference,
			);
			return {
				success: true,
				transaction: {
					type: 'Transferencia',
					reference,
					amount,
					destination: destinationDocument,
					account: destinationAccount,
					date: new Date().toISOString()
				}
			};
		} catch (e: any) {
			if (e.status === 303) throw e;
			if (e instanceof AppError) {
				return fail(400, { error: e.message });
			}
			console.error('Unexpected Transfer Error:', e);
			return fail(500, { error: 'Ha ocurrido un error inesperado' });
		}
	},

	mobilePayment: async ({ request, locals }) => {
		const data = await request.formData();
		let destinationDocument = data.get('destination_document')?.toString();
		if (!destinationDocument) {
			const docPrefix = data.get('doc_prefix')?.toString() || 'V';
			const docNumber = data.get('doc_number')?.toString();
			if (docNumber) destinationDocument = `${docPrefix}-${docNumber}`;
		}
		const destinationPhone = data.get('destination_phone')?.toString();
		const bankCode = data.get('bank_code')?.toString();
		const amountStr = data.get('amount')?.toString();
		const amount = Number(amountStr);

		if (!destinationDocument || !destinationPhone || !bankCode || !amount || amount <= 0) {
			return fail(400, { error: 'Datos de pago móvil inválidos' });
		}

		try {
			const reference = generateNumericReference();
			await LedgerService.processMobilePayment(
				locals.user!.id,
				destinationDocument,
				destinationPhone,
				bankCode,
				amount,
				reference,
			);
			return {
				success: true,
				transaction: {
					type: 'Pago Móvil',
					reference,
					amount,
					destination: destinationDocument,
					phone: destinationPhone,
					bank: bankCode,
					date: new Date().toISOString()
				}
			};
		} catch (e: any) {
			if (e.status === 303) throw e;
			if (e instanceof AppError) {
				return fail(400, { error: e.message });
			}
			console.error('Unexpected Mobile Payment Error:', e);
			return fail(500, { error: 'Ha ocurrido un error inesperado' });
		}
	},
};
