import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import { User } from '../database/models';
import { env } from '$env/dynamic/private';
import { capitalizeName } from '../utils/StringUtils';

const JWT_SECRET = env.JWT_SECRET || 'super_secret_dev_key';

export const AuthService = {
	async authenticateUser(document_id: string, password_raw: string) {
		const user = await User.getOne({ where: { document_id } });
		if (!user) throw new AppError('Credenciales inválidas');

		const isValid = await bcrypt.compare(password_raw, user.password_hash);
		if (!isValid) throw new AppError('Credenciales inválidas');

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
		// Generar cuenta de 20 dígitos: 0102 (Banky) + 16 random digits
		const account_number =
			'0102' +
			Math.floor(Math.random() * 1e16)
				.toString()
				.padStart(16, '0');

		const user = await User.createOne({
			document_id,
			email,
			phone,
			account_number,
			password_hash,
			first_name: formatted_first_name,
			last_name: formatted_last_name,
			balance: 1000,
		});
		const token = jwt.sign({ id: user.id, document_id: user.document_id }, JWT_SECRET, { expiresIn: '1h' });
		return { user, token };
	},

	async verifyToken(token: string) {
		try {
			return jwt.verify(token, JWT_SECRET) as { id: number; document_id: string };
		} catch (e) {
			return null;
		}
	},

	async rotateApiKey(userId: number) {
		const newApiKey =
			'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		await User.updateOne({ api_key: newApiKey }, { where: { id: userId } });
		return newApiKey;
	},

	async updateWebhook(userId: number, url: string) {
		await User.updateOne({ webhook_url: url }, { where: { id: userId } });
	},

	async updateProfile(userId: number, first_name: string, last_name: string, phone: string, email: string) {
		const formatted_first_name = capitalizeName(first_name);
		const formatted_last_name = capitalizeName(last_name);
		await User.updateOne({ first_name: formatted_first_name, last_name: formatted_last_name, phone, email }, { where: { id: userId } });
	},
};
