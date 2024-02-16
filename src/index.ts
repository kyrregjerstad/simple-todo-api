import { eq } from 'drizzle-orm';
import { app } from './app';
import { getDb } from './db/db';
import * as schema from './db/schema';

app.get('/', async (c) => {
	try {
		const db = getDb(c.env.DATABASE_URL);

		const result = await db.query.todos.findMany({
			limit: 100,
		});

		return c.json({
			result,
		});
	} catch (error) {
		console.log(error);
		return c.json(
			{
				error,
			},
			400,
		);
	}
});

app.get('/todos/user/:userId', async (c) => {
	const userId = parseInt(c.req.param('userId'), 10);
	if (!userId) {
		return c.json({ error: 'User ID is required' }, 400);
	}

	try {
		const db = getDb(c.env.DATABASE_URL);

		const result = await db.query.users.findFirst({
			where: eq(schema.users.id, userId),
			columns: {
				id: false,
			},
			with: {
				todos: true,
			},
		});

		if (!result) {
			return c.json({ error: 'User not found' }, 404);
		}

		return c.json(result.todos);
	} catch (error) {
		console.log(error);
		return c.json({ error: 'Failed to fetch todos' }, 500);
	}
});

app.post('/todos/user/:userId', async (c) => {
	const userId = parseInt(c.req.param('userId'), 10);
	const body = await c.req.json();
	const validation = schema.insertTodoSchema.safeParse(body);

	if (!validation.success) {
		return c.json({ error: `Invalid todo ${validation.error}` }, 400);
	}

	const todo = validation.data;

	try {
		const db = getDb(c.env.DATABASE_URL);

		const user = await db.query.users.findFirst({
			where: eq(schema.users.id, userId),
		});

		if (!user) {
			await db.insert(schema.users).values({ id: userId });
		}

		const newTodo = await db
			.insert(schema.todos)
			.values({
				...todo,
				userId,
				createdAt: new Date().toISOString(),
			})
			.returning();

		return c.json(newTodo);
	} catch (error) {
		console.log(error);
		return c.json({ error: 'Failed to create todo' }, 500);
	}
});

export default app;
