import { Model } from 'sequelize';
import type { FindOptions, CreateOptions, UpdateOptions, DestroyOptions, Identifier } from 'sequelize';

export class BaseModel extends Model {
	static async getOne<M extends BaseModel>(this: { new (): M } & typeof BaseModel, options: FindOptions): Promise<M | null> {
		return this.findOne({ raw: true, ...options }) as unknown as Promise<M | null>;
	}

	static async getAll<M extends BaseModel>(this: { new (): M } & typeof BaseModel, options?: FindOptions): Promise<M[]> {
		return this.findAll({ raw: true, ...options }) as unknown as Promise<M[]>;
	}

	static async getById<M extends BaseModel>(this: { new (): M } & typeof BaseModel, id: Identifier, options?: Omit<FindOptions, 'where'>): Promise<M | null> {
		return this.findByPk(id, { raw: true, ...options }) as unknown as Promise<M | null>;
	}

	static async createOne<M extends BaseModel>(this: { new (): M } & typeof BaseModel, values: any, options?: CreateOptions): Promise<M> {
		const instance = await this.create(values, options);
		return instance.get({ plain: true }) as unknown as M;
	}

	static async updateOne<M extends BaseModel>(this: { new (): M } & typeof BaseModel, values: any, options: UpdateOptions) {
		return this.update(values, options);
	}

	static async deleteOne<M extends BaseModel>(this: { new (): M } & typeof BaseModel, options: DestroyOptions) {
		return this.destroy(options);
	}
}
