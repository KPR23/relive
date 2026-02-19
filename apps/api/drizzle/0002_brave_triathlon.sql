ALTER TABLE "photo_share" DROP CONSTRAINT "photo_share_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "photo_share" DROP COLUMN "owner_id";