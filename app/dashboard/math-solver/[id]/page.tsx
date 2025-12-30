"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// This page handles direct links to saved solutions
// It redirects to the main page with the ID in the query string
export default function MathSolverSolutionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      // Redirect to main page with query param
      router.replace(`/dashboard/math-solver?id=${id}`);
    } else {
      router.replace('/dashboard/math-solver');
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}
