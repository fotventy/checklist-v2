'use client';

import { ChecklistForm } from '@/components/Checklist/ChecklistForm';
import { Header } from '@/components/Header';

interface HomePageProps {
  username: string;
}

export function HomePage({ username }: HomePageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Header username={username} />
          <div className="bg-white shadow rounded-lg p-6">
            <ChecklistForm />
          </div>
        </div>
      </div>
    </main>
  );
} 