import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import { User } from '../database/models';
import { env } from '$env/dynamic/private';
import { capitalizeName } from '../utils/StringUtils';
import { nanoid, customAlphabet } from 'nanoid';

const generateNumericId = customAlphabet('0123456789', 16);

const JWT_SECRET = env.JWT_SECRET || 'super_secret_dev_key';

export const AuthService = {
	async authenticateUser(document_id: string, password_raw: string) {
		const user = await User.getOne({ where: { document_id } });
		if (!user) throw new AppError('Credenciales inválidas (1)');

		const isValid = await bcrypt.compare(password_raw, user.password_hash);
		if (!isValid) throw new AppError('Credenciales inválidas (2)');

		const token = jwt.sign({ id: user.id, document_id: user.document_id }, JWT_SECRET, { expiresIn: '1h' });

		return { user, token };
	},

	async registerUser(
		document_id: string,
		email: string,
		phone: string,
		password_raw: string,
		first_name: string,
		last_name: string,
	) {
		const formatted_first_name = capitalizeName(first_name);
		const formatted_last_name = capitalizeName(last_name);

		const existing = await User.getOne({ where: { document_id } });
		if (existing) {
			throw new AppError('El documento ya está registrado');
		}
		const password_hash = await bcrypt.hash(password_raw, 10);
		// Generar cuenta de 20 dígitos: 0201 (Banky) + 16 dígitos aleatorios
		const account_number = '0201' + generateNumericId();

		const user = await User.createOne({
			document_id,
			email,
			phone,
			account_number,
			password_hash,
			first_name: formatted_first_name,
			last_name: formatted_last_name,
			balance: 500000,
		});
		const token = jwt.sign({ id: user.id, document_id: user.document_id }, JWT_SECRET, { expiresIn: '1h' });
		return { user, token };
	},

	async verifyToken(token: string) {
		try {
			return jwt.verify(token, JWT_SECRET) as {
				id: number;
				document_id: string;
				role?: string;
				username?: string;
			};
		} catch (e) {
			return null;
		}
	},

	async authenticateSuperUser(username: string, password_raw: string) {
		const expectedUser = env.SUPERUSER_USERNAME;
		const envPassword = env.SUPERUSER_PASSWORD;

		if (!expectedUser || !envPassword) {
			throw new AppError('Credenciales de superusuario no configuradas');
		}

		if (username !== expectedUser) {
			throw new AppError('Credenciales inválidas');
		}

		const expectedHash = await bcrypt.hash(envPassword, 10);
		const isValid = await bcrypt.compare(password_raw, expectedHash);

		if (!isValid) throw new AppError('Credenciales inválidas');

		const token = jwt.sign({ username, role: 'superuser' }, JWT_SECRET, { expiresIn: '8h' });
		return { user: { username, role: 'superuser' }, token };
	},

	async authenticateApiKey(apiKey: string) {
		const user = await User.getOne({ where: { api_key: apiKey } });
		if (!user) throw new AppError('API Key inválida o no autorizada');
		return user;
	},

	async rotateApiKey(userId: number) {
		const newApiKey = nanoid(64);
		await User.updateOne({ api_key: newApiKey }, { where: { id: userId } });
		return newApiKey;
	},

	async updateWebhook(userId: number, url: string) {
		await User.updateOne({ webhook_url: url }, { where: { id: userId } });
	},

	async updateProfile(userId: number, first_name: string, last_name: string, phone: string, email: string) {
		const formatted_first_name = capitalizeName(first_name);
		const formatted_last_name = capitalizeName(last_name);
		await User.updateOne(
			{ first_name: formatted_first_name, last_name: formatted_last_name, phone, email },
			{ where: { id: userId } },
		);
	},
};
