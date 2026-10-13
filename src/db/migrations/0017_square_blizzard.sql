CREATE TABLE "alertes_formation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"themes" text[] NOT NULL,
	"regions" text[] NOT NULL,
	"publics" text[] NOT NULL,
	"jeton_hash" text NOT NULL,
	"confirmee_le" timestamp with time zone,
	"dernier_envoi_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandes_formation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"motif" text,
	"donnees" jsonb NOT NULL,
	"verifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"wp_slug" text,
	"demande_le" timestamp with time zone DEFAULT now() NOT NULL,
	"traite_le" timestamp with time zone,
	"publiee_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "demandes_formation" ADD CONSTRAINT "demandes_formation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alertes_formation_email" ON "alertes_formation" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "alertes_formation_jeton" ON "alertes_formation" USING btree ("jeton_hash");--> statement-breakpoint
CREATE INDEX "demandes_formation_statut" ON "demandes_formation" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "demandes_formation_compte" ON "demandes_formation" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "demandes_formation_wp_slug" ON "demandes_formation" USING btree ("wp_slug");--> statement-breakpoint
-- « Prothèse » devient « Prothèse et CFAO » (liste unique des thèmes, 13 octobre 2026).
UPDATE "liste_attente_formation" SET "specialites" = array_replace("specialites", 'Prothèse', 'Prothèse et CFAO') WHERE 'Prothèse' = ANY("specialites");
