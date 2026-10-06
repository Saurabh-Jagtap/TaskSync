import { tasksTable } from "@/db/schema";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const result = await db.select().from(tasksTable);

    return NextResponse.json({ result }, { status: 200 })
}

export async function POST(request: Request) {
    const { title, description } = await request.json()

    if (!title || title.trim() === "" || !description || description.trim() === "") {
        return NextResponse.json({ error: 'Title and Description are required' }, { status: 400 })
    }

    const [newTask] = await db.insert(tasksTable).values(
        {
            title,
            description
        }
    ).returning();

    if (!newTask) {
        throw new Error("Task creation failed!")
    }
    return Response.json({ message: 'Task created', newTask })
}