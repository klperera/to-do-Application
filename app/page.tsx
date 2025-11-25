import { createClient } from "@/lib/supabase/client";

export default async function Home() {
  const supabase = createClient();

  const { data: todos } = await supabase.from("todos").select();

  return (
    <ul>
      {todos?.map((todo, index) => (
        <li key={index}>{todo.task}</li>
      ))}
    </ul>
  );
}
