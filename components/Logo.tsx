import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-block ${className}`}>
      <Image
        src="/logo_1.png"
        alt="ErrMate"
        width={120}
        height={80}
        className="h-8 w-auto"
        priority
      />
    </Link>
  );
}
