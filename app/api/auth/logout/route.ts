import { cookies } from "next/headers"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    cookieStore.delete('session')

    return Response.json({message: "Logout Successful"}, {status:200})
}