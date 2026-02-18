import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { user } from '../db/schema.js';
import { UserNotFoundError } from './user.errors.js';

@Injectable()
export class UserService {
  async getUserByEmail(email: string) {
    const [userRecord] = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!userRecord) {
      throw new UserNotFoundError('User not found');
    }

    return userRecord;
  }
}
