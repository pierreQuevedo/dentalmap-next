ALTER TABLE "lieux_exercice" ADD COLUMN "precision_position" text;--> statement-breakpoint
-- Amorçage : les seules précisions connues sans repasser par la BAN sont les
-- centroïdes de commune, déjà marqués. Le reste reste NULL jusqu'au prochain
-- `pnpm sync:geocode --tout`, et l'interface ne prétend rien tant qu'elle ne
-- sait pas.
UPDATE "lieux_exercice" SET "precision_position" = 'commune' WHERE "position_approximative";
