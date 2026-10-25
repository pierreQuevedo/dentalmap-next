ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "derniere_activite_le" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "inactivite_averti_le" timestamp;--> statement-breakpoint
UPDATE "user" u SET "derniere_activite_le" = greatest(u.created_at, u.updated_at, coalesce((SELECT max(s.updated_at) FROM "session" s WHERE s.user_id = u.id), u.created_at));
