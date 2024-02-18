import type { Env } from './types';

export async function cleanUpDb(env: Env) {
	try {
		return await fetch('/admin/reset-db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.BEARER_TOKEN}`,
			},
		});
	} catch (error) {
		console.error('Failed to reset transactions:', error);
	}
}
