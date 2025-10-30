"use client";

import {
  createComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/post.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";

type Posts = Awaited<ReturnType<typeof getPosts>>; // typeof getPosts funksiyanın signature-nin tipini qaytarır
// (signature-ə daxildir: funksiyanın adı, parametrləri, return type-ı)
// sonra da ReturnType ilə return etdiyi şeylərin tipini götürür
// ordan qayıdan promise-i də await edirik

type Post = Posts[number]; // indexed access: single elementin type-ı

const PostCard = ({
  post,
  loggedInAs,
}: {
  post: Post;
  loggedInAs: string | null;
}) => {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === loggedInAs)
  );
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes); // optimistic ui texnikasını işlət

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev: number) => prev + (hasLiked ? -1 : 1)); // if hasLiked then distract, else add 1
      await toggleLike(post.id);
    } catch (err) {
      console.log("Error while liking post", err);
      setOptimisticLikes(post._count.likes);
      setHasLiked(false);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const response = await createComment(post.id, newComment);
      if (response?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      }
    } catch (err) {
      console.log("Error while adding comment", err);
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const response = await deletePost(post.id);
      if (response?.success) {
        toast.success("Post deleted successfully");
      } else {
        throw new Error(response?.message);
      }
    } catch (err) {
      console.log("Error while deleting post", err);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return <div>card</div>;
};

export default PostCard;
