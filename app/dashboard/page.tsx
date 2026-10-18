'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Navbar } from '@/components/Navbar';
import { CreateKitForm } from '@/components/CreateKitForm';
import api from '@/lib/api';
import type { Kit } from '@/types/kit';

const STATUS_COLOR: Record<string, string> = {
  complete: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-600',
  researching: 'bg-blue-100 text-blue-700',
  generating: 'bg-yellow-100 text-yellow-700',
};

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [kits, setKits] = useState<Kit[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.get('/kits').then(({ data }) => { setKits(data.kits); setFetching(false); });
    }
  }, [user]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><span className="text-gray-500">Loading…</span></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Interview Kits</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {showCreate ? 'Cancel' : '+ New Kit'}
          </button>
        </div>

        {showCreate && (
          <div className="mb-6">
            <CreateKitForm onCreated={(id) => { setShowCreate(false); router.push(`/kits/${id}`); }} />
          </div>
        )}

        {fetching ? (
          <div className="text-center py-12 text-gray-400">Loading kits…</div>
        ) : kits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No kits yet</p>
            <p className="text-sm">Click &ldquo;+ New Kit&rdquo; to create your first interview prep kit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kits.map((kit) => (
              <Link key={kit._id} href={`/kits/${kit._id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{kit.source?.role || kit.companyUrl}</p>
                    <p className="text-sm text-gray-500">{kit.companyUrl}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_COLOR[kit.status] || ''}`}>
                    {kit.status}
                  </span>
                </div>
                {kit.status !== 'complete' && kit.status !== 'failed' && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 transition-all duration-500"
                        style={{ width: `${kit.progress?.percent || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{kit.progress?.step || 'Starting…'}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{kit.daysAvailable} day{kit.daysAvailable !== 1 ? 's' : ''} to prepare</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
