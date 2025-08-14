
'use client';

import { Suspense } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';
import SearchResults from '@/components/search/search-results';

function SearchLoading() {
    return (
        <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense fallback={<SearchLoading />}>
                <SearchResults />
            </Suspense>
        </main>
        <Footer />
    </div>
  );
}
