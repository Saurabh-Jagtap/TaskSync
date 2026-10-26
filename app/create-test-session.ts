import { usersTable } from "@/db/schema"
import { createSession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"

async function main(){
    // email
    // get user from db which matches this email ID
    // If not user throw error
    // {token, expiresAt} = createSession(userId)
    const email = "saurabh@example.com"

    const [user] = await db.select({id:usersTable.id}).from(usersTable).where(eq(usersTable.email, email)).limit(1)

    if(!user){
        throw new Error("Test user not found");
    }

    const {token, expiresAt} = await createSession(user.id)

    console.log("Session cookie: ", token)
    console.log("Expires AT: ", expiresAt)
}

main().catch(console.error);
