"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, LogOut } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/app/actions/auth";

interface Todo {
  id: string;
  title: string;
  content?: string | null;
  isDone: boolean;
  userId: string;
  createdAt: string;
}

interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined | undefined;
  banned: boolean | null | undefined;
  role?: string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
}

export function TodoDashboard({ user }: { user: User }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManager = user.role === "manager" || user.role === "admin";
  const isAdmin = user.role === "admin";

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const todos = await fetch("/api/todos", {
        method: "GET",
      });
      const data = await todos.json();
      setTodos(data || []);
    } catch (error) {
      console.error("Error loading todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content: description }),
      });
      setTitle("");
      setDescription("");
      await loadTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    console.log("Toggling todo:", todo);
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDone: !todo.isDone }),
      });
      await loadTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    console.log("Deleting todo with ID:", todoId);
    try {
      await fetch(`/api/todos?id=${todoId}`, {
        method: "DELETE",
      });
      await loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const canEditTodo = (todo: Todo) => {
    return todo.userId === user.id || isAdmin;
  };

  const canDeleteTodo = (todo: Todo) => {
    return todo.userId === user.id || isAdmin;
  };

  const filteredTodos = todos.filter((todo) => {
    if (user.role === "user") return todo.userId === user.id;
    return true; // managers and admins see all todos
  });

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Task Master</h1>
          <p className="text-gray-600 mt-2">
            Welcome, <span className="font-semibold">{user.email}</span> (
            {user.role || "user"})
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add a new task to your list</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Task"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>
              {user.role === "user"
                ? "Manage your personal tasks"
                : user.role === "manager"
                ? "View and mark all tasks as done"
                : "Full control over all tasks"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-600">Loading tasks...</p>
            ) : filteredTodos.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No tasks yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <Checkbox
                      checked={todo.isDone}
                      onChange={() => handleToggleTodo(todo)}
                      disabled={!canEditTodo(todo) && !isManager}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          todo.isDone
                            ? "line-through text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {todo.title}
                      </p>
                      {todo.content && (
                        <p className="text-sm text-gray-600 mt-1">
                          {todo.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Created by:{" "}
                        {todo.userId === user.id ? "You" : todo.userId}
                      </p>
                    </div>
                    {canDeleteTodo(todo) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isManager && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Manager Permissions
              </CardTitle>
              <CardDescription className="text-blue-700">
                As a {user.role}, you can:
                {isAdmin ? (
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>View all tasks from all users</li>
                    <li>Mark any task as complete</li>
                    <li>Delete any task</li>
                  </ul>
                ) : (
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>View all tasks from all users</li>
                    <li>Mark any task as complete</li>
                  </ul>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
