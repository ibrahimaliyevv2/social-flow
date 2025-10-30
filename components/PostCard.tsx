"use client";

import { getPosts, toggleLike } from "@/actions/post.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

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
      setOptimisticLikes(post._count.likes);
      setHasLiked(false);
    } finally {
      setIsLiking(false);
    }
  };
  const handleAddComment = async () => {};
  const handleDeletePost = async () => {};

  return <div>card</div>;
};

export default PostCard;
