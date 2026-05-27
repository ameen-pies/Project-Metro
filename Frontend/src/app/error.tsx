"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-metro-bg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-metro-text">
          Something went wrong
        </h2>
        <p className="text-sm text-metro-muted">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-metro-bg bg-metro-cyan rounded-xl hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
