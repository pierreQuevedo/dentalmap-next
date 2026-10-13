CREATE TABLE "alertes_cession" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"departements" text[] DEFAULT '{}' NOT NULL,
	"types" text[] DEFAULT '{}' NOT NULL,
	"jeton_hash" text NOT NULL,
	"confirmee_le" timestamp with time zone,
	"dernier_envoi_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alertes_emploi" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"email" text,
	"criteres" jsonb NOT NULL,
	"jeton_hash" text,
	"confirmee_le" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"dernier_envoi_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annonces_cession" (
	"id" text PRIMARY KEY NOT NULL,
	"auteur_user_id" uuid NOT NULL,
	"praticien_id" text NOT NULL,
	"slug" text NOT NULL,
	"statut" text DEFAULT 'brouillon' NOT NULL,
	"motif_refus" text,
	"profession" text DEFAULT 'dentiste' NOT NULL,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"description" text NOT NULL,
	"commune_code" text NOT NULL,
	"departement_code" text NOT NULL,
	"secteur" text,
	"centre" geometry(Point,4326),
	"rayon_m" integer NOT NULL,
	"fauteuils" integer,
	"ca_min" integer,
	"ca_max" integer,
	"prix" integer,
	"surface" integer,
	"disponibilite" text,
	"equipements" text[] DEFAULT '{}' NOT NULL,
	"conditions" text,
	"locaux" text,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"soumise_le" timestamp with time zone,
	"publiee_le" timestamp with time zone,
	"expire_le" timestamp with time zone,
	"rappel_envoye_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "annonces_cession_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "candidats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"situation" text NOT NULL,
	"criteres" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"qualification" text,
	"titre_verifie" boolean DEFAULT false NOT NULL,
	"formation" jsonb,
	"scolarite_verifiee" boolean DEFAULT false NOT NULL,
	"visibilite" text DEFAULT 'visible' NOT NULL,
	"structures_masquees" text[] DEFAULT '{}' NOT NULL,
	"cv_chemin" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidatures" (
	"id" text PRIMARY KEY NOT NULL,
	"offre_id" text NOT NULL,
	"candidat_user_id" uuid NOT NULL,
	"message" text,
	"statut" text DEFAULT 'nouvelle' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"objet" text DEFAULT 'cession' NOT NULL,
	"annonce_cession_id" text,
	"interlocuteur_user_id" uuid NOT NULL,
	"destinataire_user_id" uuid NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"dernier_message_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"auteur_user_id" uuid NOT NULL,
	"corps" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"lu_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offres" (
	"id" text PRIMARY KEY NOT NULL,
	"auteur_user_id" uuid NOT NULL,
	"praticien_id" text NOT NULL,
	"lieu_id" text,
	"slug" text NOT NULL,
	"metier" text NOT NULL,
	"contrat" text NOT NULL,
	"temps_plein" boolean DEFAULT true NOT NULL,
	"heures_hebdo" integer,
	"debut" text,
	"fin" text,
	"mode_remuneration" text NOT NULL,
	"remuneration_min" integer NOT NULL,
	"remuneration_max" integer NOT NULL,
	"titre" text NOT NULL,
	"description" text NOT NULL,
	"profil" text,
	"avantages" text[] DEFAULT '{}' NOT NULL,
	"commune_code" text NOT NULL,
	"departement_code" text NOT NULL,
	"position" geometry(Point,4326),
	"statut" text DEFAULT 'brouillon' NOT NULL,
	"publiee_le" timestamp with time zone,
	"confirmee_le" timestamp with time zone,
	"expire_le" timestamp with time zone,
	"cloturee_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "offres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "alertes_emploi" ADD CONSTRAINT "alertes_emploi_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces_cession" ADD CONSTRAINT "annonces_cession_auteur_user_id_user_id_fk" FOREIGN KEY ("auteur_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces_cession" ADD CONSTRAINT "annonces_cession_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces_cession" ADD CONSTRAINT "annonces_cession_commune_code_communes_code_insee_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code_insee") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces_cession" ADD CONSTRAINT "annonces_cession_departement_code_departements_code_fk" FOREIGN KEY ("departement_code") REFERENCES "public"."departements"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidats" ADD CONSTRAINT "candidats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_offre_id_offres_id_fk" FOREIGN KEY ("offre_id") REFERENCES "public"."offres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_candidat_user_id_user_id_fk" FOREIGN KEY ("candidat_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_annonce_cession_id_annonces_cession_id_fk" FOREIGN KEY ("annonce_cession_id") REFERENCES "public"."annonces_cession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_interlocuteur_user_id_user_id_fk" FOREIGN KEY ("interlocuteur_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_destinataire_user_id_user_id_fk" FOREIGN KEY ("destinataire_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_auteur_user_id_user_id_fk" FOREIGN KEY ("auteur_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offres" ADD CONSTRAINT "offres_auteur_user_id_user_id_fk" FOREIGN KEY ("auteur_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offres" ADD CONSTRAINT "offres_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offres" ADD CONSTRAINT "offres_lieu_id_lieux_exercice_id_fk" FOREIGN KEY ("lieu_id") REFERENCES "public"."lieux_exercice"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offres" ADD CONSTRAINT "offres_commune_code_communes_code_insee_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code_insee") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offres" ADD CONSTRAINT "offres_departement_code_departements_code_fk" FOREIGN KEY ("departement_code") REFERENCES "public"."departements"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alertes_cession_email" ON "alertes_cession" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "alertes_cession_jeton" ON "alertes_cession" USING btree ("jeton_hash");--> statement-breakpoint
CREATE INDEX "alertes_emploi_compte" ON "alertes_emploi" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "alertes_emploi_jeton" ON "alertes_emploi" USING btree ("jeton_hash");--> statement-breakpoint
CREATE INDEX "annonces_cession_statut" ON "annonces_cession" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "annonces_cession_departement" ON "annonces_cession" USING btree ("departement_code");--> statement-breakpoint
CREATE INDEX "annonces_cession_centre_gist" ON "annonces_cession" USING gist ("centre");--> statement-breakpoint
CREATE UNIQUE INDEX "candidatures_offre_candidat" ON "candidatures" USING btree ("offre_id","candidat_user_id");--> statement-breakpoint
CREATE INDEX "candidatures_candidat" ON "candidatures" USING btree ("candidat_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_annonce_interlocuteur" ON "conversations" USING btree ("annonce_cession_id","interlocuteur_user_id");--> statement-breakpoint
CREATE INDEX "conversations_destinataire" ON "conversations" USING btree ("destinataire_user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation" ON "messages" USING btree ("conversation_id","cree_le");--> statement-breakpoint
CREATE INDEX "offres_statut_metier" ON "offres" USING btree ("statut","metier");--> statement-breakpoint
CREATE INDEX "offres_departement" ON "offres" USING btree ("departement_code");--> statement-breakpoint
CREATE INDEX "offres_commune" ON "offres" USING btree ("commune_code");--> statement-breakpoint
CREATE INDEX "offres_praticien" ON "offres" USING btree ("praticien_id");--> statement-breakpoint
CREATE INDEX "offres_position_gist" ON "offres" USING gist ("position");