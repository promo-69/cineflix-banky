import { redirect, type Handle } from '@sveltejs/kit';
import { AuthService } from '$lib/server/services/AuthService';
import { User } from '$lib/server/database/models';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.appName = 'Banky';
  const path = event.url.pathname;

  // 1. Interceptar rutas de API internas normales
  // Excluimos /api/external/, /api/admin/ y /api/v1/pos/
  if (path.startsWith('/api/') && !path.startsWith('/api/external/') && !path.startsWith('/api/admin/') && !path.startsWith('/api/v1/pos/')) {
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

  // 1.5 Interceptar rutas API admin
  if (path.startsWith('/api/admin/')) {
    const token = event.cookies.get('admin_session');
    if (!token) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const decoded = await AuthService.verifyToken(token);
    if (!decoded || decoded.role !== 'superuser') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    event.locals.user = decoded;
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

  // 3. Redirigir de auth a dashboard si ya hay sesión normal
  const isAuthRoute = ['/login', '/signup', '/recuperar'].some(r => path === r) || path === '/';
  if (isAuthRoute) {
    const token = event.cookies.get('session');
    if (token) {
      const decoded = await AuthService.verifyToken(token);
      if (decoded && decoded.role !== 'superuser') throw redirect(303, '/dashboard');
    }
    if (path === '/') throw redirect(303, '/login');
  }

  // 4. Proteger rutas del panel de admin
  if (path.startsWith('/admin')) {
    const token = event.cookies.get('admin_session');
    if (path === '/admin/login') {
      if (token) {
        const decoded = await AuthService.verifyToken(token);
        if (decoded && decoded.role === 'superuser') throw redirect(303, '/admin/dashboard');
      }
    } else {
      if (!token) throw redirect(303, '/admin/login');
      const decoded = await AuthService.verifyToken(token);
      if (!decoded || decoded.role !== 'superuser') {
        event.cookies.delete('admin_session', { path: '/' });
        throw redirect(303, '/admin/login');
      }
      event.locals.user = decoded;
    }
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
