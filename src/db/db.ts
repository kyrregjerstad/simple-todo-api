import { neon } from '@neondatabase/serverless';
import { NeonHttpDatabase, drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export const getDb = (url: string) => {
	if (!dbInstance) {
		const sql = neon(url);
		dbInstance = drizzle(sql, { schema });
	}
	return dbInstance;
};
