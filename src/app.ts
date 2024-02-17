import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { html } from 'hono/html';
import { prettyJSON } from 'hono/pretty-json';
import { bearerAuth } from 'hono/bearer-auth';
import { swaggerUI, SwaggerUI } from '@hono/swagger-ui';
import { sentry } from '@hono/sentry';
import { openAPISpec } from './lib/open-api-spec';
import { Env } from './types';

export const app = new Hono<{ Bindings: Env }>();

app.use('*', sentry());
app.use(cors());
app.use('/admin/*', async (c, next) => {
	const token = c.env.BEARER_TOKEN;
	const bearer = bearerAuth({ token });

	return bearer(c, next);
});

app.use(prettyJSON());

app.get('/ui', swaggerUI({ url: '/doc' }));

app.get('/doc', async (c) => {
	return c.json(openAPISpec);
});

app.get('/ui', (c) => {
	return c.html(html`
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Custom Swagger</title>
			</head>
			<body>
				${SwaggerUI({ url: '/doc' })}
			</body>
		</html>
	`);
});
