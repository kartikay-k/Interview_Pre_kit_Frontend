'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth';
import { KitProgress } from '@/components/kit/KitProgress';
import { CompanyBriefSection } from '@/components/kit/CompanyBriefSection';
import { QuestionsSection } from '@/components/kit/QuestionsSection';
import { FlashcardsSection } from '@/components/kit/FlashcardsSection';
import { ScheduleSection } from '@/components/kit/ScheduleSection';
import { RoleSection } from '@/components/kit/RoleSection';
import api from '@/lib/api';
import type { Kit } from '@/types/kit';

const TABS = ['Overview', 'Questions', 'Flashcards', 'Schedule', 'Practice'] as const;
type Tab = typeof TABS[number];

function KitPageContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [kit, setKit] = useState<Kit | null>(null);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const fetchKit = useCallback(async () => {
    try {
      const { data } = await api.get(`/kits/${id}`);
      setKit(data.kit);
    } catch {
      router.push('/dashboard');
    } finally {
      setFetching(false);
    }
  }, [id, router]);

  useEffect(() => { if (user) fetchKit(); }, [user, fetchKit]);

  // Poll while generating
  useEffect(() => {
    if (!kit || kit.status === 'complete' || kit.status === 'failed') return;
    const interval = setInterval(fetchKit, 3000);
    return () => clearInterval(interval);
  }, [kit, fetchKit]);

  const handleKitUpdate = (updated: Partial<Kit>) => {
    setKit((prev) => prev ? { ...prev, ...updated } : prev);
  };

  const saveKit = async (patch: Partial<Kit>) => {
    const { data } = await api.patch(`/kits/${id}`, patch);
    setKit(data.kit);
  };

  const regenerate = async (section: string) => {
    await api.post(`/kits/${id}/regenerate`, { section });
    // Immediately set to generating then poll
    setKit((prev) => prev ? { ...prev, status: 'generating', progress: { step: `Regenerating ${section}…`, percent: 10 } } : prev);
    fetchKit();
  };

  if (loading || fetching || !kit) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-24 text-gray-400">Loading…</div>
      </div>
    );
  }

  if (kit.status !== 'complete') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-6 block">← Dashboard</Link>
          <KitProgress kit={kit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">← Dashboard</Link>
          <h1 className="text-xl font-bold flex-1 truncate">
            {kit.role?.title || 'Interview Kit'}
          </h1>
          <Link href={`/kits/${id}/practice`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            Practice
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
          {TABS.filter(t => t !== 'Practice').map((tab) => (
            <button key={tab} role="tab" aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <RoleSection kit={kit} />
            <CompanyBriefSection kit={kit} onSave={saveKit} onRegenerate={regenerate} />
          </div>
        )}
        {activeTab === 'Questions' && (
          <QuestionsSection kit={kit} onSave={saveKit} onRegenerate={regenerate} />
        )}
        {activeTab === 'Flashcards' && (
          <FlashcardsSection kit={kit} onSave={saveKit} />
        )}
        {activeTab === 'Schedule' && (
          <ScheduleSection kit={kit} onRegenerate={regenerate} />
        )}
      </div>
    </div>
  );
}

export default function KitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-24 text-gray-400">Loading kit...</div>
      </div>
    }>
      <KitPageContent />
    </Suspense>
  );
}
