import { json } from '@sveltejs/kit';
import { LedgerService } from '$lib/server/services/LedgerService';
import { Transaction } from '$lib/server/database/models';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const transactions = await Transaction.findAll({
    where: { user_id: locals.user?.id },
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  return json({
    success: true,
    data: transactions.map(t => t.toJSON())
  });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { type, amount, destination_document, destination_account, destination_phone, bank_code } = body;

    if (!amount || amount <= 0) {
      return json({ success: false, error: 'Monto inválido' }, { status: 400 });
    }

    const reference = 'API-' + Math.floor(Math.random() * 1000000000);
    let resultTx;

    if (type === 'transfer') {
      if (!destination_document || !destination_account) {
        return json({ success: false, error: 'Datos de transferencia incompletos' }, { status: 400 });
      }
      resultTx = await LedgerService.processTransfer(locals.user!.id, destination_document, destination_account, amount, reference);
    } else if (type === 'mobile_payment') {
      if (!destination_document || !destination_phone || !bank_code) {
        return json({ success: false, error: 'Datos de pago móvil incompletos' }, { status: 400 });
      }
      resultTx = await LedgerService.processMobilePayment(locals.user!.id, destination_document, destination_phone, bank_code, amount, reference);
    } else {
      return json({ success: false, error: 'Tipo de transacción no soportado' }, { status: 400 });
    }

    return json({
      success: true,
      data: resultTx.toJSON()
    });
  } catch (e: any) {
    return json({ success: false, error: e.message || 'Error procesando la transacción' }, { status: 400 });
  }
};
