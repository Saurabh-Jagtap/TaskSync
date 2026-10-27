import { sessionsTable } from "@/db/schema"
import { hashSessionToken } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (sessionToken) {
        const sessionHash = hashSessionToken(sessionToken)

        await db.delete(sessionsTable).where(
            eq(sessionsTable.sessionHash, sessionHash)
        )
    }

    cookieStore.delete('session')

    return Response.json({ message: "Logout Successful" }, { status: 200 })
}