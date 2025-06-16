import React from "react";
import { Link } from "react-router-dom";

const PageNotFound= () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors px-4">
      <div className="bg-card rounded-xl shadow-lg p-10 flex flex-col items-center gap-4 max-w-md w-full border border-border">
        <div className="relative flex items-center justify-center mb-2">
          <div className="absolute inset-0 blur-xl opacity-20 rounded-full bg-accent h-24 w-24" />
        
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-center">Page Not Found</h1>
        <p className="text-muted-foreground text-center mb-4 max-w-xs">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center px-5 py-1 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow transition-colors focus:outline-none focus-visible:ring focus-visible:ring-ring"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
};

export default PageNotFound;