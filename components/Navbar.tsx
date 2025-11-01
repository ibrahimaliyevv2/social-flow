import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "../actions/user.action";
import Image from "next/image";

const Navbar = async () => {
  const user = await currentUser(); // Bu POST request olur, server action-dır deyə
  if (user) await syncUser();

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
      <div className="max-7wl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/flow.png"
                alt="Flow logo"
                width={36}
                height={36}
                priority
                className="rounded-md object-contain"
              />
              <span className="text-xl font-bold text-primary font-mono tracking-wider">
                SocialFlow
              </span>
            </Link>
          </div>
          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
