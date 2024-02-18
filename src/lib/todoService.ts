import { eq, gt } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../db/db';
import * as schema from '../db/tables';
import { seedTodosData } from './seedData';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

export const parseId = (id: string) => parseInt(id, 10);

export const fetchTodos = async (dbUrl: string, isCompleted?: boolean) =>
	getDb(dbUrl).query.todos.findMany({
		limit: 100,
		where: isCompleted !== undefined ? eq(schema.todos.completed, isCompleted) : undefined,
	});

export const fetchUserTodos = async (dbUrl: string, userId: number, isCompleted?: boolean) =>
	getDb(dbUrl).query.users.findFirst({
		where: eq(schema.users.id, userId),
		columns: { id: false },
		with: {
			todos: {
				where: isCompleted !== undefined ? eq(schema.todos.completed, isCompleted) : undefined,
				columns: {
					id: true,
					name: true,
					description: true,
					completed: true,
					createdAt: true,
				},
				limit: 100,
				orderBy: (todos, { sql, desc }) => [sql`case when ${todos.completed} then 1 else 0 end`, desc(todos.createdAt)],
			},
		},
	});

export const fetchSingleTodo = async (dbUrl: string, todoId: number) =>
	getDb(dbUrl).query.todos.findFirst({ where: eq(schema.todos.id, todoId) });

export const updateSingleTodo = async (dbUrl: string, todoId: number, updatedData: schema.UpdateTodo) => {
	const db = getDb(dbUrl);
	const updatedTodo = await db
		.update(schema.todos)
		.set({ ...updatedData, updateAt: new Date() })
		.where(eq(schema.todos.id, todoId))
		.returning();

	await logTransaction(db, 'todos', todoId, 'update');

	return updatedTodo;
};

export const completeTodo = async (dbUrl: string, todoId: number) => {
	const db = getDb(dbUrl);

	const updatedTodo = await db
		.update(schema.todos)
		.set({ completed: true, updateAt: new Date() })
		.where(eq(schema.todos.id, todoId))
		.returning();

	await logTransaction(db, 'todos', todoId, 'update');

	return updatedTodo;
};

export const upsertTodo = async (dbUrl: string, todo: schema.InsertTodo, userId: number) => {
	const db = getDb(dbUrl);
	const userExists = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });

	if (!userExists) {
		await db.insert(schema.users).values({ id: userId });
		await logTransaction(db, 'users', userId, 'create');
	}

	const newTodo = await db
		.insert(schema.todos)
		.values({ ...todo, userId })
		.returning();

	await logTransaction(db, 'todos', newTodo[0].id, 'create');

	return newTodo;
};

export const deleteTodo = async (dbUrl: string, todoId: number) => {
	const db = getDb(dbUrl);

	const deletedTodo = await db.delete(schema.todos).where(eq(schema.todos.id, todoId)).returning();

	await logTransaction(db, 'todos', todoId, 'delete');

	return deletedTodo;
};

export const getRecentUserTransactions = async (dbUrl: string) => {
	const db = getDb(dbUrl);
	const transactions = await db.query.transactions.findMany({
		with: {
			todo: {
				columns: {
					id: true,
					userId: true,
				},
			},
		},
	});

	return transactions;
};

export type Transaction = Awaited<ReturnType<typeof getRecentUserTransactions>>[number];

export const extractUniqueUserIds = (transactions: Transaction[]) => {
	const uniqueUserIds = new Set<number>();

	transactions.forEach((transaction) => {
		if (transaction.tableName === 'todos' && transaction.todo?.userId) {
			uniqueUserIds.add(transaction.todo.userId);
		}
	});
	return uniqueUserIds;
};

export const resetUsers = async (userIds: Set<number>, dbUrl: string) => {
	const resetPromises = Array.from(userIds).map(async (userId) => {
		await deleteUser(dbUrl, userId);
		return seedUser(dbUrl, userId);
	});

	await Promise.all(resetPromises);
};
export const seedUser = async (dbUrl: string, id: number) => {
	if (id > 999) return; // Only seed users with IDs less than 999

	const db = getDb(dbUrl);
	const res = await db.insert(schema.users).values({ id });

	const todoInsertPromises = seedTodosData.map((todo) =>
		db.insert(schema.todos).values({
			userId: id,
			...todo,
		}),
	);

	await Promise.all(todoInsertPromises);

	return res;
};

export const deleteUser = async (dbUrl: string, id: number) => await getDb(dbUrl).delete(schema.users).where(eq(schema.users.id, id));

export const getCreatedUsers = async (dbUrl: string) => {
	return getDb(dbUrl).query.users.findMany({
		where: gt(schema.users.id, 999),
	});
};

export const deleteCreatedUsers = async (dbUrl: string) => await getDb(dbUrl).delete(schema.users).where(gt(schema.users.id, 999));

type TableName = 'todos' | 'users';
type Action = 'create' | 'update' | 'delete';

const logTransaction = async (db: NeonHttpDatabase<typeof schema>, tableName: TableName, recordId: number, action: Action) =>
	db.insert(schema.transactions).values({
		tableName,
		recordId,
		action,
	});

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
