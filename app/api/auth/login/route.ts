import { usersTable } from "@/db/schema"
import { createSession, setSessionCookie } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
    // validate inputs
    // fetch user using session
    // hash password
    // validate password with db
    // if not, then throw error - 401
    // call create session fn
    // set cookie
    const cookieStore = await cookies()

    const { email, password } = await request.json()
    if (!email || email.trim() === "" || !password || password.trim() === "") {
        throw new Error("Invalid email or password")
    }

    const [user] = await db.select().from(usersTable).where(
        eq(usersTable.email, email)
    ).limit(1)

    if (!user) {
        return Response.json(
            { message: "Invalid email or password" },
            { status: 401 }
        );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
        throw new Error("Invalid email or password")
    }

    const { token, expiresAt } = await createSession(user.id)

    setSessionCookie(token, expiresAt)

    return Response.json({ message: "Login Successful" }, { status: 200 })
}