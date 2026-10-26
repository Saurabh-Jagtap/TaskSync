import crypto from 'node:crypto';
import { db } from '../db';
import { sessionsTable, usersTable } from '@/db/schema';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

export const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

export const hashSessionToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifySessionToken = (token: string, hash: string) => {
    const tokenHash = hashSessionToken(token);

    const tokenBuffer = Buffer.from(tokenHash, "hex");
    const hashBuffer = Buffer.from(hash, "hex");

    if (tokenBuffer.length !== hashBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, hashBuffer);
};

export const createSession = async (userId: string) => {
    const token = generateSessionToken();
    const hash = hashSessionToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(sessionsTable).values({
        userId,
        sessionHash: hash,
        expiresAt,
    });

    return { token, expiresAt };
};

export const setSessionCookie = async (
    token: string,
    expiresAt: Date
  ) => {
    const cookieStore = await cookies();
  
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  };

  export const getCurrentUser = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
  
    if (!token) {
      return null;
    }
  
    const tokenHash = hashSessionToken(token);
  
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(
        eq(sessionsTable.sessionHash, tokenHash)
      )
      .limit(1);
  
    if (!session || session.expiresAt <= new Date()) {
      return null;
    }
  
    const [user] = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);
  
    return user ?? null;
  };
