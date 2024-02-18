import { InferInsertModel, relations, sql } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const tableNameEnum = pgEnum('table_name_enum', ['todos', 'users']);
export const actionEnum = pgEnum('action_enum', ['create', 'update', 'delete']);

export const transactions = pgTable('transactions', {
	id: serial('id').primaryKey(),
	tableName: tableNameEnum('table_name').notNull(),
	recordId: serial('record_id'), // Assuming IDs in your tables are serial types
	action: actionEnum('action').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const todos = pgTable('todos', {
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 250 }).notNull(),
	description: varchar('description', { length: 500 }),
	completed: boolean('completed').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.default(sql`now()`),
	updateAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const usersRelations = relations(users, ({ many }) => ({
	todos: many(todos),
	transactions: many(transactions),
}));

export const todosRelations = relations(todos, ({ one, many }) => ({
	user: one(users, {
		fields: [todos.userId],
		references: [users.id],
	}),
	transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
	user: one(users, {
		fields: [transactions.recordId],
		references: [users.id],
	}),
	todo: one(todos, {
		fields: [transactions.recordId],
		references: [todos.id],
	}),
}));

export const selectTodoSchema = createSelectSchema(todos);
export const insertTodoSchema = z.object({
	name: z.string().min(1).max(250),
	description: z.string().min(1).max(500).optional(),
	completed: z.boolean().optional(),
});
export const updateTodoSchema = z.object({
	name: z.string().min(1).max(250).optional(),
	description: z.string().min(1).max(500).nullish(),
	completed: z.boolean().optional(),
});

export type InsertUser = InferInsertModel<typeof users>;
export type InsertTodoSchema = typeof insertTodoSchema;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodoSchema = typeof updateTodoSchema;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
