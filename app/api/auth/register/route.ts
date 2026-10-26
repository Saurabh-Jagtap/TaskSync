import { usersTable } from "@/db/schema"
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers";
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  // validate inputs
  // find user
  // if user is found then throw error
  // hash the password
  // insert the record into users table in db
  // create session
  // set cookie
  const cookieStore = await cookies()

  const { email, password, firstName, lastName } = await request.json()
  if (!email || email.trim() === "" ||
    !password || password.trim() === "" ||
    !firstName || firstName.trim() === "" ||
    !lastName || lastName.trim() === "") {
    throw new Error("Invalid credentials")
  }

  const [user] = await db.select().from(usersTable).where(
    eq(usersTable.email, email)
  ).limit(1)

  if (user) {
    throw new Error("User already exists!")
  }

  const salt = 10
  const passwordHash = await bcrypt.hash(password, salt)

  const [newUser] = await db.insert(usersTable).values({
    firstName,
    lastName,
    email,
    passwordHash
  }).returning()

  const { token, expiresAt } = await createSession(newUser.id)

  setSessionCookie(token, expiresAt)

  return Response.json({ message: "Registration Successful!", newUser }, { status: 201 })
}