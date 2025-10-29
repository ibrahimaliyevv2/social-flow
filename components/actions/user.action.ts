"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// A webhook is a way for one application to send real-time data or notifications 
// to another application via an HTTP request (usually POST) when a specific event happens.

// Buradakı tema da webhook-dur, clerk-dəki data-mızı Neon-a göndəririk, save edir oradakı postgre bazamıza

export const syncUser = async () => {
    try {
        const {userId} = await auth();
        const user = await currentUser();

        if(!userId || !user) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        });

        if(existingUser) return existingUser;

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: user.firstName || "",
                surname: user.lastName || "",
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl
            }
        });

        return dbUser;
    } catch (err) {
        console.log("Error in syncUser", err)
    }
}