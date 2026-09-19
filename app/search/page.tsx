import { redirect } from 'next/navigation';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (!q) {
    redirect('/');
  }
  const clean = q.trim().replace(/^@/, '');
  redirect(`/@${clean}`);
}
