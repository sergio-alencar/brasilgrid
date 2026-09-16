CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cell_pick_count" (
	"puzzle_id" integer NOT NULL,
	"cell" smallint NOT NULL,
	"uf" text NOT NULL,
	"picks" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "cell_pick_count_puzzle_id_cell_uf_pk" PRIMARY KEY("puzzle_id","cell","uf")
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" text NOT NULL,
	"puzzle_id" integer NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"guesses_used" smallint DEFAULT 0 NOT NULL,
	"correct_count" smallint DEFAULT 0 NOT NULL,
	"final_rarity" real,
	"share_id" text DEFAULT substr(md5(random()::text), 1, 10) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "game_share_id_unique" UNIQUE("share_id")
);
--> statement-breakpoint
CREATE TABLE "guess" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guess_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"game_id" text NOT NULL,
	"cell" smallint NOT NULL,
	"uf" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"nickname" text,
	"show_in_ranking" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
CREATE TABLE "puzzle" (
	"id" integer PRIMARY KEY NOT NULL,
	"play_date" date NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "puzzle_play_date_unique" UNIQUE("play_date")
);
--> statement-breakpoint
CREATE TABLE "puzzle_category" (
	"puzzle_id" integer NOT NULL,
	"axis" text NOT NULL,
	"position" smallint NOT NULL,
	"category_id" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"members" text[] NOT NULL,
	CONSTRAINT "puzzle_category_puzzle_id_axis_position_pk" PRIMARY KEY("puzzle_id","axis","position")
);
--> statement-breakpoint
CREATE TABLE "puzzle_cell" (
	"puzzle_id" integer NOT NULL,
	"cell" smallint NOT NULL,
	"valid_ufs" text[] NOT NULL,
	CONSTRAINT "puzzle_cell_puzzle_id_cell_pk" PRIMARY KEY("puzzle_id","cell"),
	CONSTRAINT "cell_range" CHECK ("puzzle_cell"."cell" between 0 and 8)
);
--> statement-breakpoint
CREATE TABLE "puzzle_stats" (
	"puzzle_id" integer PRIMARY KEY NOT NULL,
	"players" integer DEFAULT 0 NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text,
	"puzzle_id" integer NOT NULL,
	"cell" smallint,
	"uf" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"is_anonymous" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_pick_count" ADD CONSTRAINT "cell_pick_count_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guess" ADD CONSTRAINT "guess_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puzzle_category" ADD CONSTRAINT "puzzle_category_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puzzle_cell" ADD CONSTRAINT "puzzle_cell_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puzzle_stats" ADD CONSTRAINT "puzzle_stats_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "game_user_puzzle_idx" ON "game" USING btree ("user_id","puzzle_id");--> statement-breakpoint
CREATE INDEX "game_puzzle_idx" ON "game" USING btree ("puzzle_id");--> statement-breakpoint
CREATE INDEX "guess_game_idx" ON "guess" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guess_correct_uf_idx" ON "guess" USING btree ("game_id","uf") WHERE "guess"."is_correct";--> statement-breakpoint
CREATE UNIQUE INDEX "guess_correct_cell_idx" ON "guess" USING btree ("game_id","cell") WHERE "guess"."is_correct";--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");