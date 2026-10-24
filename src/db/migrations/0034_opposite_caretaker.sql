ALTER TABLE "revendications" ADD COLUMN "titulaire_averti_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "titulaire_reponse" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "titulaire_repondu_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "moderation_relancee_le" timestamp with time zone;