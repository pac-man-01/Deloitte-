import React from "react";
import { Link } from "react-router-dom";

const NotAuthorized = () => {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors">
      <div className="bg-card rounded-lg shadow-md p-8 flex flex-col items-center">
        <svg
          className="w-16 h-16 text-destructive mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
        <p className="text-muted-foreground mb-4 text-center max-w-xs">
          You do not have permission to access this page. Please check your account or contact the administrator.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 mt-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
};

export default NotAuthorized;