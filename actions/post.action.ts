"use server";

import prisma from "@/lib/prisma";
import { getUserIdFromDB } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, imageUrl: string) => {
    try {
        const userId = await getUserIdFromDB();
        const post = await prisma.post.create({
            data:{
                content: content,
                image: imageUrl,
                authorId: userId
            }
        });

        revalidatePath("/"); // fetch again for not having stale data
        return {success: true, post}; 
    } catch (err) {
        console.log("Error happened while creating a post", err);
        return {success: false, message: "Failed to create post"};
    }
};