CREATE TABLE "demandes_ajout_etablissement" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"uai" text NOT NULL,
	"ville" text NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"demande_le" timestamp with time zone DEFAULT now() NOT NULL,
	"traite_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fiches_etablissement" (
	"slug" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"donnees" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"publiee_le" timestamp with time zone,
	"mis_a_jour_le" timestamp with time zone DEFAULT now() NOT NULL,
	"mis_a_jour_par" uuid
);
--> statement-breakpoint
CREATE TABLE "liste_attente_formation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"organisme" text NOT NULL,
	"specialites" text[] NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revendications_etablissement" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"type" text NOT NULL,
	"methode" text NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"justificatif_chemin" text,
	"justificatif_nom" text,
	"justificatif_taille" integer,
	"motif_refus" text,
	"demande_le" timestamp with time zone DEFAULT now() NOT NULL,
	"traite_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "demandes_ajout_etablissement" ADD CONSTRAINT "demandes_ajout_etablissement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiches_etablissement" ADD CONSTRAINT "fiches_etablissement_mis_a_jour_par_user_id_fk" FOREIGN KEY ("mis_a_jour_par") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liste_attente_formation" ADD CONSTRAINT "liste_attente_formation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revendications_etablissement" ADD CONSTRAINT "revendications_etablissement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demandes_ajout_etab_statut" ON "demandes_ajout_etablissement" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "liste_attente_formation_email" ON "liste_attente_formation" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "revendications_etab_compte_slug" ON "revendications_etablissement" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "revendications_etab_slug" ON "revendications_etablissement" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "revendications_etab_statut" ON "revendications_etablissement" USING btree ("statut");