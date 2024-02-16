import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
});

export const todos = pgTable('todos', {
	userId: integer('user_id').references(() => users.id),
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 250 }).notNull(),
	description: varchar('description', { length: 500 }),
	completed: boolean('completed').notNull().default(false),
	createdAt: varchar('created_at').notNull().default('now()'),
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

export const insertTodoSchema = createInsertSchema(todos);
export const selectTodoSchema = createSelectSchema(todos);
