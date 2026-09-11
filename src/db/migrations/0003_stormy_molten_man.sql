ALTER TABLE "communes" ADD COLUMN "nom_recherche" text;--> statement-breakpoint
CREATE INDEX "communes_recherche_trgm" ON "communes" USING gin ("nom_recherche" gin_trgm_ops);