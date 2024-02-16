import { InferInsertModel, relations, sql } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
});

export const todos = pgTable('todos', {
	userId: integer('user_id').references(() => users.id),
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 250 }).notNull(),
	description: varchar('description', { length: 500 }),
	completed: boolean('completed').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const usersRelations = relations(users, ({ many }) => ({
	todos: many(todos),
}));

export const todosRelations = relations(todos, ({ one }) => ({
	user: one(users, {
		fields: [todos.userId],
		references: [users.id],
	}),
}));

export const selectTodoSchema = createSelectSchema(todos);

export type InsertUser = InferInsertModel<typeof users>;

export const insertTodoSchema = z.object({
	name: z.string().min(1).max(250),
	description: z.string().min(1).max(500).optional(),
	completed: z.boolean().optional(),
});

export type InsertTodoSchema = typeof insertTodoSchema;
export type InsertTodo = z.infer<typeof insertTodoSchema>;

export const updateTodoSchema = z.object({
	name: z.string().min(1).max(250).optional(),
	description: z.string().min(1).max(500).nullish(),
	completed: z.boolean().optional(),
});

export type UpdateTodoSchema = typeof updateTodoSchema;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
