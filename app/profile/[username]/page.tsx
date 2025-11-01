import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { getUserIdFromDB } from "@/actions/user.action";
import { notFound } from "next/navigation";
import ProfileContent from "./ProfileContent";

export const generateMetadata = async ({
  params,
}: {
  params: Awaited<{ username: string }>;
}) => {
  const { username } = await params; // Next 15-dən bu yana params və searchParams server component-lərdə artıq asinxrondur

  const user = await getProfileByUsername(username); // params.username yazanda error verir çünki yuxarıdakı kimi yazmasaq
  // params hələ ki, promise kimi sayılır və params.username yazanda undefined qaytarır, buna görə də await edib destructure edirik
  if (!user) return;

  return {
    title: `${user.name}${user.surname ? ` ${user.surname}` : ''}`,
    description: user.bio || `Check out ${user.username}'s profile in flow!`,
  };
};

const ProfilePage = async ({
  params,
}: {
  params: Awaited<{ username: string }>;
}) => {
  const { username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) return notFound(); // User bazada tapılmasa default-da olan (özümüzün hazırladığımız) not found page-imizi qaytaracaq

  const [posts, likedPosts, isLoggedInUserFollowing, loggedInUserId] =
    await Promise.all([
      getUserPosts(user.id),
      getUserLikedPosts(user.id),
      isFollowing(user.id),
      getUserIdFromDB(),
    ]);

  return (
    <ProfileContent
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isLoggedInUserFollowing}
      loggedInUserId={loggedInUserId}
    />
  );
};

export default ProfilePage;
