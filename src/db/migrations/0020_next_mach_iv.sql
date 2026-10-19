ALTER TABLE "fiches_completees" ADD COLUMN "lien_google_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "lien_google_dernier_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "lien_google_clics" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "lien_google_relance_le" timestamp with time zone;