CREATE TABLE "fiches_completees" (
	"id" text PRIMARY KEY NOT NULL,
	"praticien_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"horaires" jsonb,
	"langues" text[] DEFAULT '{}' NOT NULL,
	"accessibilite" text[] DEFAULT '{}' NOT NULL,
	"accessibilite_commentaire" text,
	"paiements" text[] DEFAULT '{}' NOT NULL,
	"tiers_payant" text,
	"etape" integer DEFAULT 0 NOT NULL,
	"termine_le" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fiches_completees_praticien_id_unique" UNIQUE("praticien_id")
);
--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "methode" text DEFAULT 'manuelle' NOT NULL;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "identifiant_psc" text;--> statement-breakpoint
ALTER TABLE "revendications" ADD COLUMN "rpps_verifie" text;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD CONSTRAINT "fiches_completees_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD CONSTRAINT "fiches_completees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;