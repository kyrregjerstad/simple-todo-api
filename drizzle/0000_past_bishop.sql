CREATE TABLE IF NOT EXISTS "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(250) NOT NULL,
	"description" varchar(500),
	"completed" boolean DEFAULT false NOT NULL
);
