CREATE TABLE "folder_share_link" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"folder_id" text NOT NULL,
	"permission" "share_permission" NOT NULL,
	"expires_at" timestamp,
	"password_hash" text,
	"revoked_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "folder_share_link_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "photo_share_link" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"photo_id" text NOT NULL,
	"permission" "share_permission" NOT NULL,
	"expires_at" timestamp,
	"password_hash" text,
	"revoked_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "photo_share_link_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "folder_share" DROP CONSTRAINT "folder_share_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "folder_share_link" ADD CONSTRAINT "folder_share_link_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_share_link" ADD CONSTRAINT "folder_share_link_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_share_link" ADD CONSTRAINT "photo_share_link_photo_id_photo_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_share_link" ADD CONSTRAINT "photo_share_link_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "folder_share_link_folder_idx" ON "folder_share_link" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "folder_share_link_token_idx" ON "folder_share_link" USING btree ("token");--> statement-breakpoint
CREATE INDEX "photo_share_link_photo_idx" ON "photo_share_link" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "photo_share_link_token_idx" ON "photo_share_link" USING btree ("token");--> statement-breakpoint
ALTER TABLE "folder_share" DROP COLUMN "owner_id";