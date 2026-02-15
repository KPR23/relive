CREATE TYPE "public"."share_permission" AS ENUM('VIEW', 'EDIT');--> statement-breakpoint
ALTER TYPE "public"."photo_status" ADD VALUE 'DELETING';--> statement-breakpoint
CREATE TABLE "folder_share" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"folder_id" text NOT NULL,
	"shared_with_id" text NOT NULL,
	"permission" "share_permission" NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"aaguid" text,
	CONSTRAINT "passkey_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "photo_share" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"photo_id" text NOT NULL,
	"shared_with_id" text NOT NULL,
	"permission" "share_permission" NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "camera_make" text;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "camera_model" text;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "lens_model" text;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "exposure_time" real;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "f_number" real;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "iso" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "focal_length" real;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "focal_length_35mm" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "gps_lat" real;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "gps_lng" real;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "gps_altitude" real;--> statement-breakpoint
ALTER TABLE "folder_share" ADD CONSTRAINT "folder_share_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_share" ADD CONSTRAINT "folder_share_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_share" ADD CONSTRAINT "folder_share_shared_with_id_user_id_fk" FOREIGN KEY ("shared_with_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_share" ADD CONSTRAINT "photo_share_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_share" ADD CONSTRAINT "photo_share_photo_id_photo_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_share" ADD CONSTRAINT "photo_share_shared_with_id_user_id_fk" FOREIGN KEY ("shared_with_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "folder_share_folder_idx" ON "folder_share" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "folder_share_shared_with_idx" ON "folder_share" USING btree ("shared_with_id");--> statement-breakpoint
CREATE UNIQUE INDEX "folder_share_unique_idx" ON "folder_share" USING btree ("folder_id","shared_with_id");--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "passkey" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "photo_share_photo_idx" ON "photo_share" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "photo_share_shared_with_idx" ON "photo_share" USING btree ("shared_with_id");--> statement-breakpoint
CREATE UNIQUE INDEX "photo_share_unique_idx" ON "photo_share" USING btree ("photo_id","shared_with_id");--> statement-breakpoint
ALTER TABLE "photo" DROP COLUMN "exif";