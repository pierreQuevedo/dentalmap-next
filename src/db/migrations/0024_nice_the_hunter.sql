CREATE TABLE "echanges_candidature" (
	"candidature_id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"creneaux" text[] NOT NULL,
	"telephone_recruteur" text NOT NULL,
	"contact_recruteur" text,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"creneau_choisi" text,
	"telephone_candidat" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"repondu_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "candidatures" ADD COLUMN "cv_chemin" text;--> statement-breakpoint
ALTER TABLE "candidatures" ADD COLUMN "cv_nom" text;--> statement-breakpoint
ALTER TABLE "candidatures" ADD COLUMN "cv_taille" integer;--> statement-breakpoint
ALTER TABLE "candidatures" ADD COLUMN "vue_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "echanges_candidature" ADD CONSTRAINT "echanges_candidature_candidature_id_candidatures_id_fk" FOREIGN KEY ("candidature_id") REFERENCES "public"."candidatures"("id") ON DELETE cascade ON UPDATE no action;