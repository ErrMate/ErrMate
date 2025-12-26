"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "./Logo";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { BugIcon } from "./BugIcon";
import { Tooltip } from "./Tooltip";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full py-4 px-6 border-b border-gray-800 bg-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <Tooltip text="Error Analyzer" position="bottom">
                <Link
                  href="/error-analyzer"
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <BugIcon className="w-10 h-10" />
                </Link>
              </Tooltip>
              <UserProfileDropdown
                user={{
                  name: session.user?.name,
                  email: session.user?.email,
                  image: session.user?.image,
                }}
              />
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-6 py-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-md font-medium hover:from-red-600 hover:via-red-700 hover:to-red-800 transition"
            >
              Sign In with Google
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
