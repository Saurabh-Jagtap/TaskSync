
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteProject, getProjectById, updateProject } from "@/app/features/projects/project.service";


type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request,context: RouteContext) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const project = await getProjectById(id, user.id);

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { result: [project] },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to fetch project:", error);

        return NextResponse.json(
            { error: "Unable to fetch project." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request,context: RouteContext) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body." },
                { status: 400 }
            );
        }

        if (typeof body !== "object" || body === null) {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400 }
            );
        }

        const { title, description } = body as {
            title?: unknown;
            description?: unknown;
        };

        const updateData: {title?: string;description?: string} = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return NextResponse.json({ error: "Invalid title" },{ status: 400 });
            }

            updateData.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string" ||!description.trim()) {
                return NextResponse.json({ error: "Invalid description" },{ status: 400 });
            }

            updateData.description = description.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        const updatedProject = await updateProject(id,user.id,updateData);

        if (!updatedProject) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({message: "Project updated Successfully!",updatedProject,},{ status: 200 }
        );
    } catch (error) {
        console.error("Failed to update project:", error);

        return NextResponse.json({ error: "Unable to update project." },{ status: 500 });
    }
}

export async function DELETE(_request: Request,context: RouteContext) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const deletedProject = await deleteProject(id, user.id);

        if (!deletedProject) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({message: "Project deleted Successfully!",deletedProject},{ status: 200 });
    } catch (error) {
        console.error("Failed to delete project:", error);

        return NextResponse.json({ error: "Unable to delete project." },{ status: 500 });
    }
}
