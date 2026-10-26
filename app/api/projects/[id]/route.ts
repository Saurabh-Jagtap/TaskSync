import { projectsTable } from "@/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
    const { id } = await ctx.params

    if (!id) {
        return NextResponse.json({ error: "No ID found" })
    }

    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const [deletedProject] = await db.delete(projectsTable).where(
            and(
                eq(projectsTable.id, id),
                eq(projectsTable.userId, user.id)
            )
        ).returning()

        if (!deletedProject) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Project deleted Successfully!", deletedProject }, { status: 200 })

    } catch (error) {
        console.error("Failed to delete project:", error);

        return NextResponse.json(
            { error: "Unable to delete project." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
    const { title, description } = await request.json()

    const { id } = await ctx.params

    if (!id) {
        return NextResponse.json({ error: "No ID found" })
    }

    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    let updateData: { title?: string, description?: string } = {};

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


    const [updatedProject] = await db.update(projectsTable).set(updateData).where(
        and(
                eq(projectsTable.id, id),
                eq(projectsTable.userId, user.id)
            )
    ).returning()

    if (!updatedProject) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Project updated Successfully!", updatedProject }, { status: 200 })
}