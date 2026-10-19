CREATE TABLE "parrainages" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"parrain_id" uuid NOT NULL,
	"parrain_praticien_id" text NOT NULL,
	"email" text NOT NULL,
	"filleul_user_id" uuid,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"ouverte_le" timestamp with time zone,
	"relance_le" timestamp with time zone,
	"desinscrit_le" timestamp with time zone,
	"felicite_le" timestamp with time zone,
	CONSTRAINT "parrainages_code_unique" UNIQUE("code"),
	CONSTRAINT "parrainages_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_parrain_id_user_id_fk" FOREIGN KEY ("parrain_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_parrain_praticien_id_praticiens_id_fk" FOREIGN KEY ("parrain_praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_filleul_user_id_user_id_fk" FOREIGN KEY ("filleul_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parrainages_parrain" ON "parrainages" USING btree ("parrain_id","cree_le");--> statement-breakpoint
CREATE INDEX "parrainages_filleul" ON "parrainages" USING btree ("filleul_user_id");