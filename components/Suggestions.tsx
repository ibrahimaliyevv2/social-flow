import Link from "next/link";
import { getUserSuggestions } from "../actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";

const Suggestions = async () => {
  const suggestedUsers = await getUserSuggestions().catch(() => []);

  if (suggestedUsers.length === 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Friend Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600">There are no suggestions.</div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex gap-2 items-center justify-between "
            >
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.username}`}>
                  <Avatar>
                    <AvatarImage src={user.image ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-xs">
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-medium cursor-pointer"
                  >
                    {user.name}{user.surname ? ` ${user.surname}` : ''}
                  </Link>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-muted-foreground">
                    {user._count.followers} followers
                  </p>
                </div>
              </div>
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Suggestions;
