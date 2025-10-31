import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <Image
        src="/404.png"
        alt="Page not found"
        width={400}
        height={400}
        className="mb-6"
        priority
      />
      <h1 className="text-3xl font-semibold mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button
        size="sm"
        variant="secondary"
        className="w-20 cursor-pointer"
        asChild
      >
        <Link href="/" className="px-6 py-2 text-white rounded-xl transition">
          Go Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
