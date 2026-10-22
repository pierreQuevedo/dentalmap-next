-- Plus d'échange : le recruteur reçoit les coordonnées dès la candidature.
-- Le téléphone donné lors d'un échange accepté est gardé sur la candidature, puis les états d'échange redeviennent « Vue ».
ALTER TABLE "candidats" ADD COLUMN "telephone" text;--> statement-breakpoint
ALTER TABLE "candidatures" ADD COLUMN "telephone" text;--> statement-breakpoint
UPDATE "candidatures" k SET "telephone" = e."telephone_candidat" FROM "echanges_candidature" e WHERE e."candidature_id" = k."id" AND e."telephone_candidat" IS NOT NULL;--> statement-breakpoint
UPDATE "candidatures" SET "statut" = 'vue' WHERE "statut" IN ('echange_propose', 'echange_accepte');--> statement-breakpoint
DROP TABLE "echanges_candidature" CASCADE;
