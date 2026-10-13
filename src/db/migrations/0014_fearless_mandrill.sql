CREATE TABLE "invitations_fiche" (
	"id" text PRIMARY KEY NOT NULL,
	"praticien_id" text NOT NULL,
	"invite_par" uuid NOT NULL,
	"email" text NOT NULL,
	"fonction" text,
	"jeton_hash" text NOT NULL,
	"statut" text DEFAULT 'envoyee' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"acceptee_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "techniques" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "materiaux" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "usinage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "empreintes_stl" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "impression_3d" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "delais" jsonb;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "rayon_km" integer;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "ramassage" boolean;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "jours_ramassage" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "transporteur" boolean;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "realisations" jsonb;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "credit_photos" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "ansm_numero" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "ansm_declare_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "savoir_faire_confirme_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "delais_confirmes_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "zone_confirmee_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "realisations_confirmees_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "praticien_lie_id" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "role_labo" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "mandat_chemin" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "mandat_nom" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "gerant_email" text;--> statement-breakpoint
ALTER TABLE "invitations_fiche" ADD CONSTRAINT "invitations_fiche_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations_fiche" ADD CONSTRAINT "invitations_fiche_invite_par_user_id_fk" FOREIGN KEY ("invite_par") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitations_praticien" ON "invitations_fiche" USING btree ("praticien_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_jeton" ON "invitations_fiche" USING btree ("jeton_hash");--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD CONSTRAINT "fiches_completees_praticien_lie_id_praticiens_id_fk" FOREIGN KEY ("praticien_lie_id") REFERENCES "public"."praticiens"("id") ON DELETE set null ON UPDATE no action;