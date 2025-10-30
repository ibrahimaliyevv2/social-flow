"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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
};

export const getUserByClerkId = async (clerkId: string) => {
    return prisma.user.findUnique({
        where: {
            clerkId: clerkId
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true
                }
            }
        }
    })
};

export const getUserIdFromDB = async () => {
    const {userId:clerkId} = await auth(); // User id in clerk
    if(!clerkId) return null;

    const user = await getUserByClerkId(clerkId);
    if(!user) throw new Error("User not found");

    return user.id;
};

export const getUserSuggestions = async () => {
    try {
        const userId = await getUserIdFromDB();

        if(!userId) return [];

        const suggestedUsers = await prisma.user.findMany({
            where: {
                AND: [{
                    NOT: {id: userId} // not show myself :)
                }, {
                    NOT: {
                        followers: {
                            some: {
                                followerId: userId // not show users I already follow :)
                            }
                        }
                    }
                }]
            },
            select: {
                id: true,
                name: true,
                surname: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    }
                }
            },
            take: 3,
        });

        return suggestedUsers;
    } catch (err) {
        console.log("Error occured while fetching suggested users", err);
        return [];
    }
}

export const toggleFollow = async (userId: string) => {
    try {
        const loggedInUserId = await getUserIdFromDB(); // myself (logged in user)

        if(!loggedInUserId) return;

        if(loggedInUserId === userId) throw new Error("You can not follow yourself"); 

        const alreadyFollows = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: loggedInUserId,
                    followingId: userId
                }
            }
        });

        if(alreadyFollows) {
            // artıq follow edirsə, unfollow edəcək bu button-la
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: loggedInUserId,
                        followingId: userId
                    }
                }
            })
        } else{
            // əks təqdirdə follow funksiyası

            // $transaction is used when the operations are independent of each other but must be part of the same all-or-nothing unit,
            // ya hər iki əməliyyat işləyəcək, ya da heç biri - burada follow edib bildiriş göndərmə məsələsidir
            await prisma.$transaction([ 
                prisma.follows.create({
                    data: {
                        followerId: loggedInUserId,
                        followingId: userId
                    }
                }),
                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: userId, // follow olunan user-ə notification gəlir ki, sən follow olundun (follow edilən user)
                        creatorId: loggedInUserId // səbəbkar (follow edən user)
                    }
                })
            ]);

            revalidatePath("/");
            return {success: true};
        }

    } catch (err) {
        console.log("Error in toggleFollow", err);
        return {success: false, message: "Error in toggleFollow"};
    }
}