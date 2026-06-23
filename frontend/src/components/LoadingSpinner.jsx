function LoadingSpinner({ size = "md", label }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[2.5px]",
    xl: "h-10 w-10 border-[3px]",
  };

  return (
    <div className="inline-flex items-center gap-3">
      <span className="relative flex items-center justify-center">
        <span
          className={`block rounded-full border-white/20 border-t-purple-400 border-r-purple-500/60 animate-spin ${sizeClasses[size] || sizeClasses.md}`}
        />
        <span
          className={`absolute rounded-full animate-ping opacity-20 bg-purple-400 ${size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3"}`}
        />
      </span>
      {label && (
        <span className="text-sm text-white/50 animate-pulse-glow">
          {label}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
