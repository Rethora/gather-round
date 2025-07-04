import Link from 'next/link';

export default function StyledLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out underline decoration-blue-600/30 hover:decoration-blue-800/50 dark:decoration-blue-400/30 dark:hover:decoration-blue-300/50 underline-offset-2 hover:underline-offset-4"
    >
      {children}
    </Link>
  );
}
