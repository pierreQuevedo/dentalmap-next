CREATE TABLE "redirections" (
	"id" text PRIMARY KEY NOT NULL,
	"ancien_chemin" text NOT NULL,
	"nouveau_chemin" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"registre" text NOT NULL,
	"url" text,
	"publie_le" timestamp with time zone,
	"taille_octets" integer,
	"sha256" text,
	"telecharge_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"registre" text NOT NULL,
	"source_snapshot_id" text,
	"statut" text DEFAULT 'en_cours' NOT NULL,
	"demarre_le" timestamp with time zone DEFAULT now() NOT NULL,
	"termine_le" timestamp with time zone,
	"lignes_lues" integer DEFAULT 0 NOT NULL,
	"inserees" integer DEFAULT 0 NOT NULL,
	"modifiees" integer DEFAULT 0 NOT NULL,
	"supprimees" integer DEFAULT 0 NOT NULL,
	"erreurs" jsonb
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"praticien_id" text NOT NULL,
	"registre" text NOT NULL,
	"statut" text NOT NULL,
	"verifie_le" timestamp with time zone DEFAULT now() NOT NULL,
	"payload_hash" text,
	"sync_run_id" text
);
--> statement-breakpoint
ALTER TABLE "lieux_exercice" ADD COLUMN "position_approximative" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lieux_exercice" ADD COLUMN "score_geocodage" real;--> statement-breakpoint
ALTER TABLE "praticiens" ADD COLUMN "source_snapshot_id" text;--> statement-breakpoint
ALTER TABLE "praticiens" ADD COLUMN "indexable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_sync_run_id_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."sync_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "redirections_ancien_chemin" ON "redirections" USING btree ("ancien_chemin");--> statement-breakpoint
CREATE INDEX "source_snapshots_registre" ON "source_snapshots" USING btree ("registre","telecharge_le");--> statement-breakpoint
CREATE INDEX "sync_runs_registre" ON "sync_runs" USING btree ("registre","demarre_le");--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_praticien_registre" ON "verifications" USING btree ("praticien_id","registre");--> statement-breakpoint
CREATE INDEX "verifications_statut" ON "verifications" USING btree ("statut");--> statement-breakpoint
ALTER TABLE "praticiens" ADD CONSTRAINT "praticiens_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "praticiens_indexables" ON "praticiens" USING btree ("profession","indexable") WHERE "praticiens"."deleted_at" is null;