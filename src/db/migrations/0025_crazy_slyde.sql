ALTER TABLE "candidats" ADD COLUMN "experiences" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "candidats" ADD COLUMN "competences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "candidats" ADD COLUMN "cv_nom" text;--> statement-breakpoint
ALTER TABLE "candidats" ADD COLUMN "cv_taille" integer;--> statement-breakpoint
ALTER TABLE "candidats" ADD COLUMN "termine_le" timestamp with time zone;