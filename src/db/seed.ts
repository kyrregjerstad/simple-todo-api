import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { Env } from '../index';

const seedDB = async () => {
	const sql = neon(c.env.DATABASE_URL);

	const db = drizzle(sql);
};
