"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



export async function signUpWithEmail(name: string, email: string, password: string) {
console.log("Signing up with:", { name, email, password }); 
  await auth.api.signUpEmail({
    body: {  
        email, 
        password,  
        name,
    },
  });
  redirect("/dashboard");
}

export async function signInWithEmail(email: string, password: string) {
  await auth.api.signInEmail({
    body: { 
        email, 
        password, 
    },
  });
  redirect("/dashboard");
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}