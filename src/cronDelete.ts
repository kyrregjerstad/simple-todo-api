import type { Env } from './types';

export async function handleScheduledEvent(event: ScheduledEvent) {
	console.log('Running scheduled event :)');
	await fetch('http://localhost:8787/health');
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(handleScheduledEvent(event));
	},
};
