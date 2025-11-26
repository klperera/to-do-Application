import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import  prisma  from "@/lib/prisma";
import { z } from "zod";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().optional(),
  isDone: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
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

    let todos;
    if (user.role === "user") {
      // Users can only see their own todos
      todos = await prisma.todo.findMany({
        where: { userId: user.id },
        include: { 
          user: { 
            select: { 
              name: true, 
              email: true,
              role: true 
            } 
          } 
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Managers and Admins can see all todos
      todos = await prisma.todo.findMany({
        include: { 
          user: { 
            select: { 
              name: true, 
              email: true,
              role: true 
            } 
          } 
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = todoSchema.parse(body);

    const todo = await prisma.todo.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
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

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest
) {
  try {

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing todo ID" }, { status: 400 });
    }
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
      where: { id: id },
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
      where: { id: id },
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
) {
  try {
        const id = request.nextUrl.searchParams.get("id");
        if (!id) {
      return NextResponse.json({ error: "Missing todo ID" }, { status: 400 });
    }

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
      where: { id: id },
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
      where: { id: id },
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