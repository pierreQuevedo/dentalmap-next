CREATE TABLE "avis_etablissement" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" uuid NOT NULL,
	"lien" text NOT NULL,
	"annee" text,
	"note" integer NOT NULL,
	"texte" text NOT NULL,
	"statut" text DEFAULT 'publie' NOT NULL,
	"motif_retrait" text,
	"reponse" text,
	"repondu_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "signalements_avis" (
	"id" text PRIMARY KEY NOT NULL,
	"avis_id" text NOT NULL,
	"user_id" uuid,
	"par_etablissement" boolean DEFAULT false NOT NULL,
	"motif" text NOT NULL,
	"detail" text,
	"statut" text DEFAULT 'ouvert' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"traite_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "avis_etablissement" ADD CONSTRAINT "avis_etablissement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signalements_avis" ADD CONSTRAINT "signalements_avis_avis_id_avis_etablissement_id_fk" FOREIGN KEY ("avis_id") REFERENCES "public"."avis_etablissement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signalements_avis" ADD CONSTRAINT "signalements_avis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "avis_etab_slug_compte" ON "avis_etablissement" USING btree ("slug","user_id");--> statement-breakpoint
CREATE INDEX "avis_etab_slug_statut" ON "avis_etablissement" USING btree ("slug","statut");--> statement-breakpoint
CREATE UNIQUE INDEX "signalements_avis_compte" ON "signalements_avis" USING btree ("avis_id","user_id");--> statement-breakpoint
CREATE INDEX "signalements_avis_statut" ON "signalements_avis" USING btree ("statut");