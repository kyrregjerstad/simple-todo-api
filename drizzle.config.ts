import type { Config } from 'drizzle-kit';

export default {
	schema: './src/db/tables.ts',
	out: './drizzle',
} satisfies Config;
