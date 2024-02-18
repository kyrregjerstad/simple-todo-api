DO $$ BEGIN
 CREATE TYPE "action_enum" AS ENUM('create', 'update', 'delete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "table_name_enum" AS ENUM('todos', 'users');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_name" "table_name_enum" NOT NULL,
	"record_id" serial NOT NULL,
	"action" "action_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
