CREATE TABLE "communes" (
	"code_insee" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"slug" text NOT NULL,
	"departement_code" text NOT NULL,
	"codes_postaux" text[] DEFAULT '{}' NOT NULL,
	"population" integer,
	"centre" geometry(Point,4326)
);
--> statement-breakpoint
CREATE TABLE "departements" (
	"code" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"slug" text NOT NULL,
	"region_code" text NOT NULL,
	CONSTRAINT "departements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lieux_exercice" (
	"id" text PRIMARY KEY NOT NULL,
	"praticien_id" text NOT NULL,
	"adresse_ligne" text,
	"code_postal" text,
	"code_insee" text,
	"position" geometry(Point,4326),
	"telephone_officiel" text,
	"principal" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "praticiens" (
	"id" text PRIMARY KEY NOT NULL,
	"profession" text NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"prenom" text,
	"raison_sociale" text,
	"rpps" text,
	"adeli" text,
	"siren" text,
	"siret" text,
	"statut_verification" text DEFAULT 'non_verifie' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "praticiens_slug_unique" UNIQUE("slug"),
	CONSTRAINT "praticiens_rpps_unique" UNIQUE("rpps")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"code" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communes" ADD CONSTRAINT "communes_departement_code_departements_code_fk" FOREIGN KEY ("departement_code") REFERENCES "public"."departements"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departements" ADD CONSTRAINT "departements_region_code_regions_code_fk" FOREIGN KEY ("region_code") REFERENCES "public"."regions"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lieux_exercice" ADD CONSTRAINT "lieux_exercice_praticien_id_praticiens_id_fk" FOREIGN KEY ("praticien_id") REFERENCES "public"."praticiens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lieux_exercice" ADD CONSTRAINT "lieux_exercice_code_insee_communes_code_insee_fk" FOREIGN KEY ("code_insee") REFERENCES "public"."communes"("code_insee") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "communes_dep_slug" ON "communes" USING btree ("departement_code","slug");--> statement-breakpoint
CREATE INDEX "communes_nom_trgm" ON "communes" USING gin ("nom" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "lieux_position_gist" ON "lieux_exercice" USING gist ("position");--> statement-breakpoint
CREATE INDEX "lieux_commune" ON "lieux_exercice" USING btree ("code_insee");--> statement-breakpoint
CREATE INDEX "praticiens_profession" ON "praticiens" USING btree ("profession");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");