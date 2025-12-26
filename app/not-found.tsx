import Link from "next/link";
import { BugIcon } from "@/components/BugIcon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <BugIcon className="w-32 h-32 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Oops! It looks like you&apos;ve encountered a bug. The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/error-analyzer"
            className="px-6 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
          >
            Go to Error Analyzer
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all border border-gray-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

