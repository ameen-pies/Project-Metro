export default function NotFound() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-metro-bg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-metro-text">
          Page not found
        </h2>
        <p className="text-sm text-metro-muted">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 text-sm font-medium text-metro-bg bg-metro-cyan rounded-xl hover:opacity-90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
