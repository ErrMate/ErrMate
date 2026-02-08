import Link from "next/link";
import { Header } from "@/components/Header";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  AccessDenied: {
    title: "Access denied",
    description:
      "Your Google account is not allowed to sign in. If this app is in Testing mode, only added test users can sign in. Ask the app owner to add your email as a test user, or to publish the app to Production.",
  },
  Callback: {
    title: "Sign-in error",
    description:
      "Something went wrong during sign-in (e.g. database or server error). Check the app logs. If you just signed up, try again in a moment.",
  },
  CallbackRouteError: {
    title: "Sign-in error",
    description: "The sign-in callback failed. Check that NEXTAUTH_URL and Google redirect URIs match your production URL.",
  },
  Default: {
    title: "Sign-in error",
    description:
      "Something went wrong. If only one Google account works, the app is likely in Testing mode—only test users can sign in. Publish the OAuth app to Production or add your email as a test user.",
  },
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error ?? "Default";
  const { title, description } = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h1 className="text-xl font-semibold text-red-800">{title}</h1>
            <p className="mt-2 text-red-700 text-sm">{description}</p>
            <p className="mt-3 text-gray-500 text-xs font-mono">{error}</p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
