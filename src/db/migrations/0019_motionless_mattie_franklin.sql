CREATE TABLE "passkey" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp DEFAULT now(),
	"aaguid" text
);
--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "rappel_fraicheur_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "rappels_coupes_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "liens_testes_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fiches_completees" ADD COLUMN "liens_echecs" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "cle_proposee_fois" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "cle_proposee_le" timestamp;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "passkey" USING btree ("credential_id");