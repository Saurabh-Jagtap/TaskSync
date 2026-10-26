import { projectsTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    const user = await getCurrentUser();
    
        if (!user) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

    const result = await db.select().from(projectsTable).where(eq(projectsTable.userId, user.id));

    return Response.json({ result }, { status: 200 });
}

export async function POST(request: Request) {
    const { title, description } = await request.json()

    if (!title || title.trim() === "" || !description || description.trim() === "") {
        return Response.json({ error: "Title and Description are required" }, { status: 400 });
    }

    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const [newProject] = await db.insert(projectsTable).values({
        userId: user.id,
        title,
        description
    }).returning();

    if (!newProject) {
        return Response.json({ error: "Project creation failed!" }, { status: 500 });
    }

    return Response.json({ message: "Project created successfully!", newProject });
}

