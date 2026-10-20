ALTER TABLE "alertes_emploi" ADD COLUMN "titre" text;--> statement-breakpoint
ALTER TABLE "alertes_emploi" ADD COLUMN "frequence" text DEFAULT 'hebdomadaire' NOT NULL;