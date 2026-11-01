import { createComment, getCommentsByTaskId } from "@/features/comments/comments.service";
import { getCurrentUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST(request: Request, ctx: RouteContext<'/api/tasks/[id]/comments'>) {
    // validate the request
    // Get the user
    // insert the comment into the database
    // return response

    try {
        const { id } = await ctx.params;
        const { content } = await request.json()

        if (!content || content.trim() === "") {
            return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
        }

        const result = await createComment(id, content);

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Failed to add comment", error);

        return NextResponse.json({ error: "Unable to fetch tasks." }, { status: 500 });
    }

}

export async function GET(request: Request, ctx: RouteContext<'/api/tasks/[id]/comments'>) {
    try {
        const { id } = await ctx.params;

        if (!id || id.trim() === "") {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const result = await getCommentsByTaskId(id, user.id);

        if (!result) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch comments", error);
        return NextResponse.json({ error: "Unable to fetch comments" }, { status: 500 });
    }
}