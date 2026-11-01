import { deleteComment, updateComment } from "@/features/comments/comments.service";
import { getCurrentUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, ctx: RouteContext<'/api/comments/[commentId]'>) {
    try {
        const { commentId } = await ctx.params;

        if (!commentId || commentId.trim() === "") {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const result = await deleteComment(commentId, user.id);

        if (!result) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        return NextResponse.json({ result }, { status: 200 });

    } catch (error) {
        console.error("Failed to delete comment", error);
        return NextResponse.json({ error: "Unable to fetch comments" }, { status: 500 });
    }
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/comments/[commentId]">) {
    try {
        // Authenticate user
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get comment ID
        const { commentId } = await ctx.params;

        if (!commentId || commentId.trim() === "") {
            return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
        }

        // Parse request body
        const body: unknown = await request.json();

        if (typeof body !== "object" || body === null || !("content" in body) || typeof body.content !== "string" || !body.content.trim()) {
            return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
        }

        // Update comment
        const updatedComment = await updateComment(commentId, user.id, body.content.trim()
        );

        if (!updatedComment) {
            return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Comment updated successfully", result: updatedComment, }, { status: 200 }
        );

    } catch (error) {
        console.error("Failed to update comment:", error);

        return NextResponse.json({ error: "Unable to update comment" }, { status: 500 });
    }
}