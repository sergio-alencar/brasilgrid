DROP INDEX "game_user_puzzle_idx";--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "mode" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "game_user_puzzle_mode_idx" ON "game" USING btree ("user_id","puzzle_id","mode");