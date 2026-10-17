CREATE TABLE "alertes_espace_pro" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"motif" text NOT NULL,
	"rpps" text,
	"exercice" text,
	"praticien_id" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"envoyee_le" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "praticiens" ADD COLUMN "retire_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "objet" text DEFAULT 'revendication' NOT NULL;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "justificatif_chemin" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "justificatif_nom" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "justificatif_taille" integer;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "motif_refus" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "commentaire_refus" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "lieux_geres" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "alertes_espace_pro" ADD CONSTRAINT "alertes_espace_pro_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alertes_espace_pro" ADD CONSTRAINT "alertes_espace_pro_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alertes_compte_motif_rpps" ON "alertes_espace_pro" USING btree ("user_id","motif","rpps");--> statement-breakpoint
CREATE INDEX "alertes_rpps" ON "alertes_espace_pro" USING btree ("rpps");