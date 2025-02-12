'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error }: { error: Error }) {
  const router = useRouter();

  useEffect(() => {
    console.error('An error occurred:', error);
  }, [error]);

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl mb-4">Oops! Something went wrong.</h1>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        onClick={() => router.back()}
      >
        Go Back
      </button>
    </div>
  );
}
