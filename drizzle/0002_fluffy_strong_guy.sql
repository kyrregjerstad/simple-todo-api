CREATE TABLE IF NOT EXISTS "user_to_todos" (
	"user_id" integer,
	"todo_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_todos" ADD CONSTRAINT "user_to_todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_todos" ADD CONSTRAINT "user_to_todos_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
