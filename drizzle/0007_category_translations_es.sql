ALTER TABLE "puzzle_category" ADD COLUMN "label_es" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "puzzle_category" ADD COLUMN "description_es" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "puzzle_category" ALTER COLUMN "label_es" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "puzzle_category" ALTER COLUMN "description_es" DROP DEFAULT;
