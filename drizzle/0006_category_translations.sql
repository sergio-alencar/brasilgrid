-- Rótulo/descrição em inglês da categoria, para o switch PT/EN. Grades já
-- publicadas recebem '' temporariamente; um script de backfill preenche o
-- valor de verdade a partir do catálogo atual de categorias (por category_id).
ALTER TABLE "puzzle_category" ADD COLUMN "label_en" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "puzzle_category" ADD COLUMN "description_en" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "puzzle_category" ALTER COLUMN "label_en" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "puzzle_category" ALTER COLUMN "description_en" DROP DEFAULT;
