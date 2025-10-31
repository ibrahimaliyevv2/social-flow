"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <Image
        src="/error.png"
        alt="Error occured"
        width={400}
        height={400}
        className="mb-6"
        priority
      />
      <h1 className="text-3xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6">
        Something went wrong while loading this page. Try refreshing or come
        back in a moment.
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

export default Error;
