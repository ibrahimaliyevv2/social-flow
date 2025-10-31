const ProfilePage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  // Next 15-dən bu yana params və searchParams server component-lərdə artıq asinxrondur.
  const { username } = await params;
  console.log("params:", username);
  return <div>Profile page</div>;
};

export default ProfilePage;
