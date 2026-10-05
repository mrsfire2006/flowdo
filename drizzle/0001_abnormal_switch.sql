ALTER TABLE "task" ADD COLUMN "focus_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "focus_elapsed_seconds" integer DEFAULT 0 NOT NULL;