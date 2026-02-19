ALTER TABLE "folder_share" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "photo_share" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;