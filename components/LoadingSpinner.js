export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 dark:border-primary-400 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
