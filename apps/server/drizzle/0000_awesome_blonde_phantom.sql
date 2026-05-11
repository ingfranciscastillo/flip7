CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" text NOT NULL,
	"winner_id" text NOT NULL,
	"winner_name" text NOT NULL,
	"rounds" integer NOT NULL,
	"final_scores" jsonb NOT NULL,
	"ended_at" timestamp DEFAULT now() NOT NULL
);
