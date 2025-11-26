import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
          Welcome to Task Master
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 mx-auto max-w-2xl leading-relaxed">
          Organize your tasks with role-based access control. Manage your
          productivity efficiently.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/sign-in">
            <Button size="lg" className="w-full sm:w-auto min-w-[150px]">
              Login
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[150px]"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
