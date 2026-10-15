import { projectsTable, tasksTable } from "@/db/schema"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
    const { title, description } = await request.json()
    const { id } = await ctx.params

    if (!id) {
        return NextResponse.json({ error: "No ID found" })
    }

    if (!title || title.trim() === "" || !description || description.trim() === "") {
        return NextResponse.json({ error: 'Title and Description are required' }, { status: 400 })
    }

    const [newTask] = await db.insert(tasksTable).values(
        {
            title,
            description,
            projectId: id
        }
    ).returning();

    if (!newTask) {
        throw new Error("Task creation failed!")
    }
    return Response.json({ message: 'Task created', newTask })
}

export async function DELETE(request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
    const { id } = await ctx.params

    if (!id) {
        return NextResponse.json({ error: "No ID found" })
    }

    const [deletedProject] = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning()

    if (!deletedProject) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Project deleted Successfully!", deletedProject }, { status: 200 })
}
