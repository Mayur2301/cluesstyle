import PageLoader from "@/app/components/PageLoader";

// Next.js's special `loading.tsx` file — no imports/wiring needed anywhere
// else. It's shown automatically the instant a user clicks a <Link> (or
// calls router.push) while the destination route is still being prepared,
// and swaps out for the real page the moment it's ready. Placed at the app
// root, it covers every route that doesn't define its own more specific
// loading.tsx.
export default function Loading() {
  return <PageLoader />;
}