CREATE TABLE "recrutement_cabinets" (
	"praticien_id" text PRIMARY KEY NOT NULL,
	"presentation" text,
	"avantages" text[] DEFAULT '{}' NOT NULL,
	"lieu_id" text,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recrutement_cabinets" ADD CONSTRAINT "recrutement_cabinets_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recrutement_cabinets" ADD CONSTRAINT "recrutement_cabinets_lieu_id_lieux_exercice_id_fk" FOREIGN KEY ("lieu_id") REFERENCES "public"."lieux_exercice"("id") ON DELETE set null ON UPDATE no action;