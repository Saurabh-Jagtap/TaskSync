import { projectsTable } from "@/db/schema";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    const projects = await db.select().from(projectsTable);

    return Response.json({ projects }, { status: 200 });
}

export async function POST(request: Request) {
    const { title, description } = await request.json()

    if (!title || title.trim() === "" || !description || description.trim() === "") {
        return Response.json({ error: "Title and Description are required" }, { status: 400 });
    }

    const [project] = await db.insert(projectsTable).values({
        title,
        description
    }).returning();

    if (!project) {
        return Response.json({ error: "Project creation failed!" }, { status: 500 });
    }

    return Response.json({ message: "Project created successfully!", project});
}

