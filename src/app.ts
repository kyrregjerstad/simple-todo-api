import { Hono } from 'hono';

import { prettyJSON } from 'hono/pretty-json';
import { Env } from './types';
import { bearerAuth } from 'hono/bearer-auth';

export const app = new Hono<{ Bindings: Env }>();

app.use('/admin/*', async (c, next) => {
	const token = c.env.BEARER_TOKEN;
	const bearer = bearerAuth({ token });

	return bearer(c, next);
});

app.use(prettyJSON());
