
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createProject, getProjectsByUserId } from "@/app/features/projects/project.service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getProjectsByUserId(user.id);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    return NextResponse.json(
      { error: "Unable to fetch projects." },
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

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "Title and Description are required." },
        { status: 400 }
      );
    }

    const newProject = await createProject(user.id, {
      title: title.trim(),
      description: description.trim(),
    });

    if (!newProject) {
      return NextResponse.json(
        { error: "Project creation failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Project created successfully!", newProject },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to create project:", error);

    return NextResponse.json(
      { error: "Unable to create project." },
      { status: 500 }
    );
  }
}
