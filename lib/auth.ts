import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";


export const auth = betterAuth({
    appName: "To-Do Application",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: { 
        enabled: true, 
        minPasswordLength: 6,
        validateEmail: (email: string) => email.includes("@")
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [
        admin(),
        nextCookies()
    ] // make sure this is the last plugin in the array

});