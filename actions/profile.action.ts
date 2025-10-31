"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserIdFromDB } from "./user.action";

export const getProfileByUsername = async (username: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                id: true,
                name: true,
                surname: true,
                username: true,
                bio: true,
                image: true,
                location: true,
                website: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });

        return user;
    } catch (err) {
        console.log("Error occured while fetching user profile", err);
        throw new Error("Failed to fetch profile");
    }
};

export const getUserPosts = async (userId: string) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (err) {
    console.log("Error occured while fetching user posts:", err);
    throw new Error("Failed to fetch user posts");
  }
};

export const getUserLikedPosts = async(userId: string) => {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return likedPosts;
  } catch (err) {
    console.log("Error occured while fetching liked posts:", err);
    throw new Error("Failed to fetch liked posts");
  }
}

export const updateProfile = async (formData: FormData) => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    revalidatePath("/profile");
    return { success: true, user };
  } catch (err) {
    console.log("Error occured while updating profile:", err);
    return { success: false, message: "Failed to update profile" };
  }
};

export const isFollowing = async (userId: string) => {
    // showing follow or unfollow text in button 
  try {
    const loggedInUserId = await getUserIdFromDB();
    if (!loggedInUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    return !!follow; 
    // double negation - əgər user follow edirsə true, etməsə false verəcək
    // işlətməkdə əsas məqsəd odur ki, follow özü ya obyekt ya da null qaytaracaq, obyektin beləsi true,
    // null-ınkı false edəcək, çünki !null -> true, !true -> false verir. Obyektdə də buna oxşar.
  } catch (err) {
    console.log("Error occured while checking follow status:", err);
    return false;
  }
}