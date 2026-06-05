import { json } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import { Transaction } from '$lib/server/database/models';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ success: false, error: 'Token de autenticación faltante o inválido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await AuthService.authenticateApiKey(token);

    const reference = params.reference;
    if (!reference) {
      return json({ success: false, error: 'Referencia requerida' }, { status: 400 });
    }

    const transaction = await Transaction.findOne({
      where: {
        reference: reference,
        user_id: user.id
      }
    });

    if (!transaction) {
      return json({ success: false, error: 'Transacción no encontrada o no autorizada' }, { status: 404 });
    }

    return json({
      success: true,
      data: transaction.toJSON()
    });
  } catch (e: any) {
    const status = e.message === 'API Key inválida o no autorizada' ? 401 : 500;
    return json({ success: false, error: e.message || 'Error consultando la transacción' }, { status });
  }
};
