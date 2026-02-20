ALTER TABLE "folder_share" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "folder_share_link" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "photo_share_link" ALTER COLUMN "expires_at" SET NOT NULL;