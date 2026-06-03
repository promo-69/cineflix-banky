import { redirect, type Handle } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import { User } from '$lib/server/database/models';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.appName = 'Banky';
  const path = event.url.pathname;

  // 1. Interceptar rutas de API
  if (path.startsWith('/api/')) {
    const apiKey = event.request.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing x-api-key' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const user = await User.findOne({ where: { api_key: apiKey } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid x-api-key' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    event.locals.user = { id: user.id, document_id: user.document_id };
    return resolve(event);
  }

  // 2. Interceptar rutas internas protegidas /(app)
  const isProtectedRoute = ['/dashboard', '/transferencia', '/pago-movil', '/perfil', '/estado-cuenta', '/directorio'].some(r => path.startsWith(r));
  if (isProtectedRoute) {
    const token = event.cookies.get('session');
    if (!token) {
      throw redirect(303, '/login');
    }
    const decoded = await AuthService.verifyToken(token);
    if (!decoded) {
      event.cookies.delete('session', { path: '/' });
      throw redirect(303, '/login');
    }
    event.locals.user = decoded;
  }

  // 3. Redirigir de auth a dashboard si ya hay sesión
  const isAuthRoute = ['/login', '/signup', '/recuperar'].some(r => path === r) || path === '/';
  if (isAuthRoute) {
    const token = event.cookies.get('session');
    if (token) {
      const decoded = await AuthService.verifyToken(token);
      if (decoded) throw redirect(303, '/dashboard');
    }
    if (path === '/') throw redirect(303, '/login');
  }

  return resolve(event);
};

export const handleError = ({ error, event }: any) => {
	console.error('Global Error Captured:', error);
	
	// Only expose a safe generic message to the client
	return {
		message: 'Ha ocurrido un error inesperado. Intente más tarde.'
	};
};
