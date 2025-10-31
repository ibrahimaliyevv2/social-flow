"use server";

import prisma from "@/lib/prisma";
import { getUserIdFromDB } from "./user.action";

export const getNotifications = async () => {
    try {
        const loggedInUserId = await getUserIdFromDB();
        if(!loggedInUserId) return [];

        const notifications = await prisma.notification.findMany({
            where: {
                userId: loggedInUserId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        username: true,
                        image: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                        image: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return notifications;
    } catch (err) {
        console.log("Error occured while fetching notifications", err);
        throw new Error("Failed to fetch notifications");
    }
}

export const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationIds
                }
            },
            data: {
                read: true
            }
        });
        
        return {success: true};
    } catch (err) {
        console.log("Error occured while marking notifications as read", err);
        return {success: false, message: "Failed to mark notifications as read"};
    }
}