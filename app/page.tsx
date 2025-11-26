import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-white to-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Welcome to To Do Application
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          Organize your tasks with role-based access control. Manage your
          productivity efficiently.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/sign-in">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
