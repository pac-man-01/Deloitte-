import React from "react";
import { Link } from "react-router-dom";

// Uses Tailwind + custom color variables (e.g., bg-background, text-primary, etc.)
const UnderDevelopment = () => {
  return (
    <section className="bg-background flex justify-center items-center">
      <div className="py-8 mx-auto lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-4xl tracking-tight font-extrabold lg:text-5xl text-primary">
            Coming Soon
          </h1>
          <p className="mb-4 text-2xl tracking-tight font-bold text-foreground md:text-3xl">
            We are working on it 🚀
          </p>
          <p className="mb-6 text-lg text-muted-foreground">
            Our team is working hard to bring you an amazing experience. Stay
            tuned for updates — it’ll be worth the wait!
          </p>
          <Link to={"/home"}>
            <div className="inline-flex bg-primary text-primary-foreground hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-1.5 text-center my-4 duration-300">
              Back to HomePage
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UnderDevelopment;