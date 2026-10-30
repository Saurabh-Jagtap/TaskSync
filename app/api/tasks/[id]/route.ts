
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteTask, getTaskById, updateTask } from "@/app/features/tasks/task.service";


type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: Request,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const task = await getTaskById(id, user.id);

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ result: [task] }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch task:", error);

        return NextResponse.json(
            { error: "Unable to fetch task." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    context: RouteContext
) {
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

        const updateData: {
            title?: string;
            description?: string;
        } = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return NextResponse.json(
                    { error: "Invalid title" },
                    { status: 400 }
                );
            }

            updateData.title = title.trim();
        }

        if (description !== undefined) {
            if (
                typeof description !== "string" ||
                !description.trim()
            ) {
                return NextResponse.json(
                    { error: "Invalid description" },
                    { status: 400 }
                );
            }

            updateData.description = description.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        const updatedTask = await updateTask(
            id,
            user.id,
            updateData
        );

        if (!updatedTask) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Task updated Successfully!",
                updatedTask,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to update task:", error);

        return NextResponse.json(
            { error: "Unable to update task." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: Request,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const deletedTask = await deleteTask(id, user.id);

        if (!deletedTask) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { deletedTask },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to delete task:", error);

        return NextResponse.json(
            { error: "Unable to delete task." },
            { status: 500 }
        );
    }
}
