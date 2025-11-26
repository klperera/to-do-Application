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
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div>
            <h1 className="text-5xl font-bold bg-linear-to-r from-gray-800 to-black bg-clip-text text-transparent">
              Task Master
            </h1>
            <p className="text-gray-700 mt-3 text-lg">
              Welcome,{" "}
              <span className="font-bold text-gray-900">
                {user.name} ({user.email})
              </span>
              <span className="ml-2 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 border border-gray-300">
                {user.role || "user"}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-xl border-0 bg-white backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-linear-to-r rounded-t-xl border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Create New Task
              </CardTitle>
              <CardDescription className="text-gray-600">
                Add a new task to your list
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddTodo} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Description (optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-colors resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Task"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-800">
                To Do List
              </CardTitle>
              <CardDescription className="text-gray-600">
                {user.role === "user"
                  ? "Manage your personal tasks"
                  : user.role === "manager"
                  ? "View and mark all tasks as done"
                  : "Full control over all tasks"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-3 w-3 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-3 w-3 bg-gray-600 rounded-full animate-bounce"></div>
                  </div>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 text-lg font-medium">
                    No tasks yet. Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-start gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-lg bg-gradient-to-r from-white to-gray-50 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <Checkbox
                        checked={todo.isDone}
                        onChange={() => handleToggleTodo(todo)}
                        disabled={!canEditTodo(todo) && !isManager}
                        className="mt-1.5 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gray-700 data-[state=checked]:to-black border-2"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-base ${
                            todo.isDone
                              ? "line-through text-gray-400"
                              : "text-gray-900 group-hover:text-black"
                          } transition-colors`}
                        >
                          {todo.title}
                        </p>
                        {todo.content && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            {todo.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                          <span className="font-medium">Created by:</span>
                          <span className="text-gray-900 font-semibold">
                            {todo.userId === user.id ? "You" : todo.userId}
                          </span>
                        </p>
                      </div>
                      {canDeleteTodo(todo) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-white hover:bg-gray-800 transition-all duration-200 rounded-lg"
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
            <Card className="shadow-xl border-0 bg-gradient-to-r from-gray-800 to-black text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">👑</span>
                  Permissions
                </CardTitle>
                <CardDescription className="text-gray-300 text-base mt-4">
                  As a{" "}
                  <span className="font-bold text-white uppercase px-2 py-1 bg-white/20 rounded">
                    {user.role}
                  </span>
                  , you can:
                  {isAdmin ? (
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-gray-300">✓</span>
                        <span>View all tasks from all users</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-300">✓</span>
                        <span>Mark any task as complete</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-300">✓</span>
                        <span>Delete any task</span>
                      </li>
                    </ul>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-gray-300">✓</span>
                        <span>View all tasks from all users</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-300">✓</span>
                        <span>Mark any task as complete</span>
                      </li>
                    </ul>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
