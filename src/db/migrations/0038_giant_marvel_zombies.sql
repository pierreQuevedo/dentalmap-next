CREATE TABLE "contacts_pro" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profession" text NOT NULL,
	"prenom" text,
	"nom" text NOT NULL,
	"structure" text,
	"email" text,
	"telephone" text,
	"ville" text,
	"code_postal" text,
	"rpps" text,
	"siren" text,
	"praticien_id" text,
	"statut" text DEFAULT 'prospect' NOT NULL,
	"source" text,
	"notes" text,
	"cree_par" text,
	"modifie_par" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts_pro" ADD CONSTRAINT "contacts_pro_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contacts_pro_email" ON "contacts_pro" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contacts_pro_praticien" ON "contacts_pro" USING btree ("praticien_id");