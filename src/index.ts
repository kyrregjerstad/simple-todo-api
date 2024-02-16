import { app } from './app';
import { bearerAuth } from 'hono/bearer-auth';

import {
	completeTodo,
	deleteTodo,
	fetchSingleTodo,
	fetchTodos,
	fetchUserTodos,
	parseId,
	updateSingleTodo,
	upsertTodo,
	validateNewTodo,
	validateUpdatedTodo,
} from './lib/todoService';
import { handleScheduledEvent } from './cronDelete';
import { Env } from './types';

app.get('/todos', async (c) => {
	const completed = c.req.query('completed');
	const isCompleted = completed === 'true' ? true : completed === 'false' ? false : undefined;

	try {
		const todos = await fetchTodos(c.env.DATABASE_URL, isCompleted);
		return c.json(todos);
	} catch (error) {
		console.log(error);
		return c.json({ error }, 400);
	}
});

app.get('/todos/:todoId', async (c) => {
	const todoId = parseId(c.req.param('todoId'));
	const todo = await fetchSingleTodo(c.env.DATABASE_URL, todoId);

	if (!todo) return c.json({ error: 'Todo not found' }, 404);

	return c.json(todo);
});

app.patch('/todos/:todoId', async (c) => {
	const todoId = parseId(c.req.param('todoId'));
	const body = await c.req.json();

	const validationResult = validateUpdatedTodo(body);

	if (!validationResult.success) return c.json({ error: `Invalid todo ${validationResult.error}` }, 400);

	const todo = validationResult.data;

	try {
		const updateTodo = await updateSingleTodo(c.env.DATABASE_URL, todoId, todo);

		return c.json(updateTodo);
	} catch (error) {
		return c.json({ error: 'Failed to update todo' }, 500);
	}
});

app.delete('/todos/:todoId', async (c) => {
	const todoId = parseId(c.req.param('todoId'));

	if (!todoId) {
		return c.json({ error: 'Todo ID is required' }, 400);
	}

	const deletedTodo = await deleteTodo(c.env.DATABASE_URL, todoId);

	if (!deletedTodo || !deletedTodo.length) {
		return c.json({ error: 'Todo not found' }, 404);
	}

	return c.newResponse(null, 204); // No content to return
});

app.patch('/todos/:todoId/complete', async (c) => {
	const todoId = parseId(c.req.param('todoId'));
	const todo = await completeTodo(c.env.DATABASE_URL, todoId);

	if (!todo) return c.json({ error: 'Todo not found' }, 404);

	return c.json(todo);
});

app.get('/users/:userId/todos', async (c) => {
	const userId = parseId(c.req.param('userId'));
	if (!userId) return c.json({ success: false, error: 'User ID is required' }, 400);

	const completed = c.req.query('completed');
	const isCompleted = completed === 'true' ? true : completed === 'false' ? false : undefined;

	try {
		const userTodos = await fetchUserTodos(c.env.DATABASE_URL, userId, isCompleted);
		if (!userTodos) return c.json({ success: false, error: 'User not found' }, 404);
		return c.json(userTodos.todos);
	} catch (error) {
		console.log(error);
		return c.json({ error: 'Failed to fetch todos' }, 500);
	}
});

app.post('/users/:userId/todos', async (c) => {
	const userId = parseId(c.req.param('userId'));
	const body = await c.req.json();
	const validationResult = validateNewTodo(body);

	if (!validationResult.success) return c.json({ error: `Invalid todo ${validationResult.error}` }, 400);

	const todo = validationResult.data;

	try {
		const newTodo = await upsertTodo(c.env.DATABASE_URL, todo, userId);
		return c.json(newTodo);
	} catch (error) {
		console.log(error);
		return c.json({ error: 'Failed to create todo' }, 500);
	}
});

app.get('/health', (c) => {
	console.log('Health check');
	return c.json({ status: 'ok' });
});

app.get('/admin/reset-db', (c) => {
	console.log('Resetting db...');

	return c.json({ status: 'ok' });
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return app.fetch(request, env, ctx);
	},
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(handleScheduledEvent(event));
	},
};
