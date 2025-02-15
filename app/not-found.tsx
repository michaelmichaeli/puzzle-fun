"use client";

import React from "react";

export default function NotFound() {
  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-4">
        The page you are looking for does not exist.
      </p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  );
}
