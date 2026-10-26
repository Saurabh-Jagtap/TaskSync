import { tasksTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request, ctx: RouteContext<'/api/tasks/[id]'>) {
    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await ctx.params
    const result = await db.select().from(tasksTable).where(eq(tasksTable.id, id));;

    return NextResponse.json({ result }, { status: 200 })
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/tasks/[id]'>) {
    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await ctx.params
    const { title, description } = await request.json()
    let updateData: { title?: string, description?: string } = {}

    if (!id) {
        return NextResponse.json({ error: "Invalid Task" }, { status: 400 })
    }


    if (title !== undefined) {
        if (typeof title !== "string" || title.trim() === "") {
            return NextResponse.json({ error: "Invalid title" }, { status: 400 })
        }
        updateData.title = title
    }

    if (description !== undefined) {
        if (typeof description !== "string" || description.trim() === "") {
            return NextResponse.json({ error: "Invalid description" }, { status: 400 })
        }
        updateData.description = description
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const [updatedTask] = await db.update(tasksTable).set(updateData).where(eq(tasksTable.id, id)).returning()

    if (!updatedTask) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task updated Successfully!", updatedTask }, { status: 200 })
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await ctx.params

    if (!id) {
        return NextResponse.json({ error: "No ID found" })
    }

    const deletedTask = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning()

    if (deletedTask.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ deletedTask }, { status: 200 })
}
