"use server";

import prisma from "@/lib/prisma";
import { getUserIdFromDB } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, imageUrl: string) => {
    try {
        const userId = await getUserIdFromDB();

        if(!userId) return;

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

export const getPosts = async () => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: "desc", // latest posts at top
            },
            include: {
                author: { // including post creator info 
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        username: true,
                        image: true,

                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                username: true,
                                image: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        return posts;
    } catch (err) {
        console.log("Error in getPosts", err);
        throw new Error("Failed to fetch posts");
    }
}

export const toggleLike = async (postId: string) => {
  try {
    const loggedInUserId = await getUserIdFromDB();
    if (!loggedInUserId) return;

    // check if like exists
    const alreadyLiked = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUserId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (alreadyLiked) {
      // unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: loggedInUserId,
            postId,
          },
        },
      });
    } else {
      // like and create notification (only if liking someone else's post)
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId: loggedInUserId,
            postId,
          },
        }),
        ...(post.authorId !== loggedInUserId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId, // post author
                  creatorId: loggedInUserId, // person who liked
                  postId,
                },
              }),
            ]
          : []),
      ]);
    };

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error in toggleLike:", err);
    return { success: false, message: "Error in toggle like" };
  }
}

export const createComment = async (postId: string, content: string) => {
  try {
    const loggedInUserId = await getUserIdFromDB();

    if (!loggedInUserId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: loggedInUserId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== loggedInUserId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: loggedInUserId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (err) {
    console.error("Failed to create comment:", err);
    return { success: false, message: "Failed to create comment" };
  }
}

export const deletePost = async (postId: string) => {
  try {
    const loggedInUserId = await getUserIdFromDB();
    if (!loggedInUserId) return;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== loggedInUserId) throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete post:", err);
    return { success: false, message: "Failed to delete post" };
  }
}