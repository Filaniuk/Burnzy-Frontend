import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center text-neutral-500 text-sm">
      <p>© {new Date().getFullYear()} YT Analyzer</p>
      <div className="flex gap-4 mt-3 md:mt-0">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
