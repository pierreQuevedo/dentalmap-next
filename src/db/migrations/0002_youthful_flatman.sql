ALTER TABLE "communes" ADD COLUMN "type" text DEFAULT 'commune' NOT NULL;--> statement-breakpoint
ALTER TABLE "communes" ADD COLUMN "commune_parente_code" text;--> statement-breakpoint
CREATE INDEX "communes_parente" ON "communes" USING btree ("commune_parente_code");