import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../db/db';
import * as schema from '../db/schema';

export const parseId = (id: string) => parseInt(id, 10);

export const fetchTodos = async (dbUrl: string) => {
	const db = getDb(dbUrl);
	return db.query.todos.findMany({ limit: 100 });
};

export const fetchUserTodos = async (dbUrl: string, userId: number) => {
	const db = getDb(dbUrl);
	return db.query.users.findFirst({
		where: eq(schema.users.id, userId),
		columns: { id: false },
		with: {
			todos: {
				columns: {
					id: true,
					name: true,
					description: true,
					completed: true,
					createdAt: true,
				},
				limit: 100,
			},
		},
	});
};

export const fetchSingleTodo = async (dbUrl: string, todoId: number) => {
	const db = getDb(dbUrl);
	return db.query.todos.findFirst({ where: eq(schema.todos.id, todoId) });
};

export const updateSingleTodo = async (dbUrl: string, todoId: number, updatedData: schema.UpdateTodo) => {
	const db = getDb(dbUrl);
	return await db.update(schema.todos).set(updatedData).where(eq(schema.todos.id, todoId)).returning();
};

export const completeTodo = async (dbUrl: string, todoId: number) => {
	const db = getDb(dbUrl);
	return await db.update(schema.todos).set({ completed: true }).where(eq(schema.todos.id, todoId)).returning();
};

export const upsertTodo = async (dbUrl: string, userId: number, todo: any) => {
	const db = getDb(dbUrl);
	const userExists = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });

	if (!userExists) {
		await db.insert(schema.users).values({ id: userId });
	}

	return db
		.insert(schema.todos)
		.values({ ...todo, userId, createdAt: new Date().toISOString() })
		.returning();
};

export const deleteTodo = async (dbUrl: string, todoId: number) => {
	const db = getDb(dbUrl);
	return db.delete(schema.todos).where(eq(schema.todos.id, todoId)).returning();
};

type ValidateNewTodoReturnType = z.SafeParseReturnType<
	(typeof schema.insertTodoSchema)['_output'],
	(typeof schema.insertTodoSchema)['_input']
>;

type ValidateUpdatedTodoReturnType = z.SafeParseReturnType<
	(typeof schema.updateTodoSchema)['_output'],
	(typeof schema.updateTodoSchema)['_input']
>;

export const validateNewTodo = (body: any): ValidateNewTodoReturnType => schema.insertTodoSchema.safeParse(body);
export const validateUpdatedTodo = (body: any): ValidateUpdatedTodoReturnType => schema.updateTodoSchema.safeParse(body);