import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma  from "@/lib/prisma";
import { z } from "zod";

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateTodoSchema.parse(body);

    // BACKEND AUTHORIZATION - Critical requirement
    if (user.role === "USER") {
      // Users can only update their own todos
      if (todo.userId !== user.id) {
        return NextResponse.json(
          { error: "You can only update your own todos" },
          { status: 403 }
        );
      }
    } else if (user.role === "MANAGER") {
      // Managers can only mark todos as complete/incomplete
      const isOnlyCompletedChange = 
        Object.keys(validatedData).length === 1 && 
        'completed' in validatedData;
      
      if (!isOnlyCompletedChange) {
        return NextResponse.json(
          { error: "Managers can only mark todos as done/undone" },
          { status: 403 }
        );
      }
    }
    // Admins can update anything - no restrictions

    const updatedTodo = await prisma.todo.update({
      where: { id: params.id },
      data: validatedData,
      include: { 
        user: { 
          select: { 
            name: true, 
            email: true,
            role: true 
          } 
        } 
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // BACKEND AUTHORIZATION - Critical requirement
    if (user.role === "USER") {
      // Users can only delete their own todos
      if (todo.userId !== user.id) {
        return NextResponse.json(
          { error: "You can only delete your own todos" },
          { status: 403 }
        );
      }
    } else if (user.role === "MANAGER") {
      // Managers cannot delete any todos
      return NextResponse.json(
        { error: "Managers cannot delete todos" },
        { status: 403 }
      );
    }
    // Admins can delete anything - no restrictions

    await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}