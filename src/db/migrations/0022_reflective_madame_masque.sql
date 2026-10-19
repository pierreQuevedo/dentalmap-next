CREATE TABLE "visites_partage" (
	"praticien_id" text NOT NULL,
	"source" text NOT NULL,
	"jour" date NOT NULL,
	"nombre" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "visites_partage_praticien_id_source_jour_pk" PRIMARY KEY("praticien_id","source","jour")
);
--> statement-breakpoint
ALTER TABLE "visites_partage" ADD CONSTRAINT "visites_partage_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;