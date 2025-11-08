'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/projects'}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
