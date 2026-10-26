import { tasksTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const result = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.userId, user.id));

    return NextResponse.json({ result }, { status: 200 })
}

export async function POST(request: Request) {
    const { title, description } = await request.json()

    if (!title || title.trim() === "" || !description || description.trim() === "") {
        return NextResponse.json({ error: 'Title and Description are required' }, { status: 400 })
    }

    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const [newTask] = await db.insert(tasksTable).values(
        {
            userId: user.id,
            title,
            description
        }
    ).returning();

    if (!newTask) {
        throw new Error("Task creation failed!")
    }
    return Response.json({ message: 'Task created', newTask })
}
