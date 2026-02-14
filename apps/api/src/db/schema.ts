import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .defaultNow()
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const passkey = pgTable(
  'passkey',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('public_key').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    credentialID: text('credential_id').notNull().unique(),
    counter: integer('counter').notNull(),
    deviceType: text('device_type').notNull(),
    backedUp: boolean('backed_up').notNull(),
    transports: text('transports'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    aaguid: text('aaguid'),
  },
  (table) => [
    index('passkey_userId_idx').on(table.userId),
    index('passkey_credentialID_idx').on(table.credentialID),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  folders: many(folder),
  photos: many(photo),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const folder = pgTable(
  'folder',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    parentId: text('parent_id'),
    isRoot: boolean('is_root').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('folder_owner_idx').on(table.ownerId)],
);

export const PhotoStatusEnum = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED',
  DELETING: 'DELETING',
} as const;

export type PhotoStatus =
  (typeof PhotoStatusEnum)[keyof typeof PhotoStatusEnum];

export const photoStatus = pgEnum('photo_status', [
  PhotoStatusEnum.PENDING,
  PhotoStatusEnum.READY,
  PhotoStatusEnum.FAILED,
  PhotoStatusEnum.DELETING,
]);

export const photo = pgTable(
  'photo',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    folderId: text('folder_id')
      .notNull()
      .references(() => folder.id, { onDelete: 'cascade' }),

    filePath: text('file_path').notNull(),
    thumbPath: text('thumb_path'),

    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size'),

    width: integer('width'),
    height: integer('height'),

    cameraMake: text('camera_make'),
    cameraModel: text('camera_model'),
    lensModel: text('lens_model'),

    exposureTime: real('exposure_time'),
    fNumber: real('f_number'),
    iso: integer('iso'),

    focalLength: real('focal_length'),
    focalLength35mm: integer('focal_length_35mm'),

    gpsLat: real('gps_lat'),
    gpsLng: real('gps_lng'),
    gpsAltitude: real('gps_altitude'),

    takenAt: timestamp('taken_at'),

    status: photoStatus('status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('photo_owner_idx').on(table.ownerId),
    index('photo_folder_idx').on(table.folderId),
  ],
);

export const sharePermissionEnum = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
} as const;

export type SharePermission =
  (typeof sharePermissionEnum)[keyof typeof sharePermissionEnum];

export const sharePermission = pgEnum('share_permission', [
  sharePermissionEnum.VIEW,
  sharePermissionEnum.EDIT,
]);

export const photoShare = pgTable(
  'photo_share',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    photoId: text('photo_id')
      .notNull()
      .references(() => photo.id, { onDelete: 'cascade' }),
    sharedWithId: text('shared_with_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    permission: sharePermission('permission').notNull(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('photo_share_photo_idx').on(table.photoId),
    index('photo_share_shared_with_idx').on(table.sharedWithId),
    uniqueIndex('photo_share_unique_idx').on(table.photoId, table.sharedWithId),
  ],
);

export const photoShareRelations = relations(photoShare, ({ one }) => ({
  owner: one(user, {
    fields: [photoShare.ownerId],
    references: [user.id],
    relationName: 'photoShare_owner',
  }),
  photo: one(photo, {
    fields: [photoShare.photoId],
    references: [photo.id],
  }),
  sharedWith: one(user, {
    fields: [photoShare.sharedWithId],
    references: [user.id],
    relationName: 'photoShare_sharedWith',
  }),
}));

export const folderShare = pgTable(
  'folder_share',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    folderId: text('folder_id')
      .notNull()
      .references(() => folder.id, { onDelete: 'cascade' }),

    sharedWithId: text('shared_with_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    permission: sharePermission('permission').notNull(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('folder_share_folder_idx').on(table.folderId),
    index('folder_share_shared_with_idx').on(table.sharedWithId),
    uniqueIndex('folder_share_unique_idx').on(
      table.folderId,
      table.sharedWithId,
    ),
  ],
);

export const folderShareRelations = relations(folderShare, ({ one }) => ({
  owner: one(user, {
    fields: [folderShare.ownerId],
    references: [user.id],
    relationName: 'folderShare_owner',
  }),
  folder: one(folder, {
    fields: [folderShare.folderId],
    references: [folder.id],
  }),
  sharedWith: one(user, {
    fields: [folderShare.sharedWithId],
    references: [user.id],
    relationName: 'folderShare_sharedWith',
  }),
}));

export const folderRelations = relations(folder, ({ one, many }) => ({
  owner: one(user, {
    fields: [folder.ownerId],
    references: [user.id],
  }),
  parent: one(folder, {
    fields: [folder.parentId],
    references: [folder.id],
    relationName: 'folderHierarchy',
  }),
  children: many(folder, { relationName: 'folderHierarchy' }),
  photos: many(photo),
}));

export const photoRelations = relations(photo, ({ one }) => ({
  owner: one(user, {
    fields: [photo.ownerId],
    references: [user.id],
  }),
  folder: one(folder, {
    fields: [photo.folderId],
    references: [folder.id],
  }),
}));
