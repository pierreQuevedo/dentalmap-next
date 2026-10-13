ALTER TABLE "fiches_completees" ADD COLUMN "secteur" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "acces_pmr" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "age_minimum" integer;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "presentation" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "site_web" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "rdv_en_ligne" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "horaires_confirmes_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "conventionnement_confirme_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "accueil_confirme_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "presentation_confirmee_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "photo_confirmee_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "publiee_le" timestamp with time zone;