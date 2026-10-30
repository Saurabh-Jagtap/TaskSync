
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createTask, getTasksByUserId } from "@/app/features/tasks/task.service";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await getTasksByUserId(user.id);

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch tasks:", error);

        return NextResponse.json(
            { error: "Unable to fetch tasks." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body." },
                { status: 400 }
            );
        }

        if (
            typeof body !== "object" ||
            body === null ||
            !("title" in body) ||
            !("description" in body)
        ) {
            return NextResponse.json(
                { error: "Title and Description are required." },
                { status: 400 }
            );
        }

        const { title, description } = body;

        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            typeof description !== "string" ||
            description.trim() === ""
        ) {
            return NextResponse.json(
                { error: "Title and Description are required." },
                { status: 400 }
            );
        }

        const newTask = await createTask(user.id, {
            title: title.trim(),
            description: description.trim(),
        });

        if (!newTask) {
            return NextResponse.json(
                { error: "Task creation failed." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Task created", newTask },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to create task:", error);

        return NextResponse.json(
            { error: "Unable to create task." },
            { status: 500 }
        );
    }
}
