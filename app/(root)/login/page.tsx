import { Suspense } from "react";

type TProps = {
  searchParams: Promise<{ error?: string }>;
};

async function LoginError({ searchParams }: TProps) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-red-600">
      Unable to sign in with Google. Please try again.
    </p>
  );
}

export default function LoginPage({ searchParams }: TProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <Suspense fallback={null}>
          <LoginError searchParams={searchParams} />
        </Suspense>
        <a
          href="/api/auth/google-redirect"
          className="rounded-lg bg-foreground px-6 py-3 text-center text-background"
        >
          Continue with Google
        </a>
      </div>
    </main>
  );
}
