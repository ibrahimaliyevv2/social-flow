"use client";

import {
  getProfileByUsername,
  getUserPosts,
  updateProfile,
} from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfileContentProps {
  user: NonNullable<User>; // heç vaxt null olmur
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

const ProfileContent = ({
  user,
  posts,
  likedPosts,
  isFollowing: initialIsFollowing,
}: ProfileContentProps) => {
  const { user: loggedInUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(initialIsFollowing);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    surname: user.surname || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await updateProfile(formData);
    if (response.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
    }
  };

  const handleFollow = async () => {
    if (!loggedInUser) return;

    setIsUpdatingFollow(true);
    try {
      await toggleFollow(user.id);
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.log("Error occured in handleFollow", err);
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    loggedInUser?.username === user.username ||
    loggedInUser?.emailAddresses[0].emailAddress.split("@")[0] ===
      user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return <div>Profile Content</div>;
};

export default ProfileContent;
