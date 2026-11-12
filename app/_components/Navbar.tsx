import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center gap-6 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-sm">
      <Link href="/" className="font-semibold text-zinc-900">
        k-bapp
      </Link>
      <Link href="/stock" className="text-zinc-600 hover:text-zinc-900">
        Stock
      </Link>
    </nav>
  )
}
