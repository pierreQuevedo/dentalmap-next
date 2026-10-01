CREATE TABLE "revendications" (
	"id" text PRIMARY KEY NOT NULL,
	"praticien_id" text NOT NULL,
	"user_id" text NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"message" text,
	"demande_le" timestamp with time zone DEFAULT now() NOT NULL,
	"traite_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "revendications" ADD CONSTRAINT "revendications_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "revendications_praticien_compte" ON "revendications" USING btree ("praticien_id","user_id");--> statement-breakpoint
CREATE INDEX "revendications_statut" ON "revendications" USING btree ("statut","demande_le");