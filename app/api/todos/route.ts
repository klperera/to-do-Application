import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import  prisma  from "@/lib/prisma";
import { z } from "zod";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
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
    if (user.role === "USER") {
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