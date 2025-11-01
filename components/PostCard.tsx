"use client";

import {
  createComment,
  deleteComment,
  deletePost,
  getPosts,
  toggleLike,
  updateComment,
  updatePost,
} from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import {
  EditIcon,
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import { Textarea } from "./ui/textarea";

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
  const [showComments, setShowComments] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostContent, setEditedPostContent] = useState(
    post.content || ""
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");

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

  const handleEditPost = async () => {
    if (!editedPostContent.trim()) return;
    try {
      const response = await updatePost(post.id, editedPostContent);
      if (response?.success) {
        toast.success("Post updated successfully");
        setIsEditingPost(false);
      } else {
        throw new Error(response?.message);
      }
    } catch (err) {
      console.log("Error while updating post", err);
      toast.error("Failed to update post");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editedCommentContent.trim()) return;
    try {
      const response = await updateComment(commentId, editedCommentContent);
      if (response?.success) {
        toast.success("Comment updated successfully");
        setEditingCommentId(null);
        setEditedCommentContent("");
      } else {
        throw new Error(response?.message);
      }
    } catch (err) {
      console.log("Error while updating comment", err);
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await deleteComment(commentId);
      if (response?.success) {
        toast.success("Comment deleted successfully");
      } else {
        throw new Error(response?.message);
      }
    } catch (err) {
      console.log("Error while deleting comment", err);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:size-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                    {post.author.surname ? ` ${post.author.surname}` : ""}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {loggedInAs === post.author.id && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPost(true)}
                      className="text-muted-foreground hover:text-blue-500 cursor-pointer"
                    >
                      <EditIcon className="size-4" />
                    </Button>
                    <DeleteAlertDialog
                      isDeleting={isDeleting}
                      onDelete={handleDeletePost}
                    />
                  </div>
                )}
              </div>
              {isEditingPost && loggedInAs === post.author.id ? (
                <div className="mt-2">
                  <Textarea
                    value={editedPostContent}
                    onChange={(e) => setEditedPostContent(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingPost(false);
                        setEditedPostContent(post.content || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleEditPost}
                      disabled={!editedPostContent.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-foreground wrap-break-word">
                  {post.content}
                </p>
              )}
            </div>
          </div>

          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img // change to next Image component
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 cursor-pointer ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-2 cursor-pointer"
                >
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500 cursor-pointer"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${
                  showComments ? "fill-blue-500 text-blue-500" : ""
                }`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage
                        src={comment.author.image ?? "/avatar.png"}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                          {comment.author.surname
                            ? ` ${comment.author.surname}`
                            : ""}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                        {loggedInAs === comment.author.id && (
                          <div className="flex space-x-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditedCommentContent(comment.content);
                              }}
                              className="text-muted-foreground hover:text-blue-500 p-1 h-6 cursor-pointer"
                            >
                              <EditIcon className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-muted-foreground hover:text-red-500 p-1 h-6 cursor-pointer"
                            >
                              <TrashIcon className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="mt-1">
                          <Textarea
                            value={editedCommentContent}
                            onChange={(e) =>
                              setEditedCommentContent(e.target.value)
                            }
                            className="min-h-16 resize-none text-sm"
                          />
                          <div className="flex justify-end mt-1 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditedCommentContent("");
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditComment(comment.id)}
                              disabled={!editedCommentContent.trim()}
                              className="h-6 px-2 text-xs"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm wrap-break-word">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-20 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2 cursor-pointer disabled:cursor-alias"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2 cursor-pointer">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
