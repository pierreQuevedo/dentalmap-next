CREATE TABLE "demandes_creation_fiche" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"profession" text NOT NULL,
	"nom" text NOT NULL,
	"prenom" text,
	"raison_sociale" text,
	"rpps" text,
	"siret" text,
	"adresse" text NOT NULL,
	"code_postal" text NOT NULL,
	"ville" text NOT NULL,
	"telephone" text,
	"email" text,
	"message" text,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"praticien_id" text,
	"demande_le" timestamp with time zone DEFAULT now() NOT NULL,
	"traite_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "favoris" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"praticien_id" text NOT NULL,
	"ajoute_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "etape_tunnel" text;--> statement-breakpoint
ALTER TABLE "demandes_creation_fiche" ADD CONSTRAINT "demandes_creation_fiche_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_creation_fiche" ADD CONSTRAINT "demandes_creation_fiche_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demandes_creation_statut" ON "demandes_creation_fiche" USING btree ("statut","demande_le");--> statement-breakpoint
CREATE INDEX "demandes_creation_compte" ON "demandes_creation_fiche" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "favoris_compte_fiche" ON "favoris" USING btree ("user_id","praticien_id");--> statement-breakpoint
CREATE INDEX "favoris_compte" ON "favoris" USING btree ("user_id","ajoute_le");