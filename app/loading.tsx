"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="p-4 max-w-md mx-auto flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
    </div>
  );
}
