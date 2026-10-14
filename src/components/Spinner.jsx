export default function Spinner({ className = '' }) {
  return (
    <div
      className={`animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
