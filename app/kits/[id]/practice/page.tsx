'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import type { Flashcard } from '@/types/kit';

type ConfidenceLevel = 1 | 2 | 3;
interface CardResult { flashcardId: string; confidence: ConfidenceLevel; }

function PracticePageContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [coveredIds, setCoveredIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<CardResult[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get(`/practice/${id}/next`).then(({ data }) => {
      setFlashcards(data.flashcards);
      setCoveredIds(data.coveredIds);
      setFetching(false);
    });
  }, [user, id]);

  const currentCard = flashcards[currentIndex];
  const isLastCard = currentIndex >= flashcards.length - 1;

  const handleConfidence = async (confidence: ConfidenceLevel) => {
    const result: CardResult = { flashcardId: currentCard.id, confidence };
    const newResults = [...sessionResults, result];
    setSessionResults(newResults);

    if (isLastCard) {
      await api.post(`/practice/${id}/session`, { results: newResults });
      setSessionDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const CONFIDENCE_CONFIG: { level: ConfidenceLevel; label: string; color: string }[] = [
    { level: 1, label: 'Not sure', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { level: 2, label: 'Getting there', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { level: 3, label: 'Got it!', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  if (loading || fetching) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-24 text-gray-400">Loading…</div></div>);
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 mb-4">No flashcards available for practice.</p>
          <Link href={`/kits/${id}`} className="text-indigo-600 hover:underline">Back to kit</Link>
        </div>
      </div>
    );
  }

  if (sessionDone) {
    const avgConfidence = sessionResults.reduce((s, r) => s + r.confidence, 0) / sessionResults.length;
    const highConf = sessionResults.filter((r) => r.confidence === 3).length;
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Session complete!</h2>
          <p className="text-gray-600 mb-4">You reviewed {sessionResults.length} cards. Got it on {highConf}.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setSessionResults([]); setCurrentIndex(0); setRevealed(false); setSessionDone(false); }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
              Practice again
            </button>
            <Link href={`/kits/${id}`} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
              Back to kit
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/kits/${id}`} className="text-sm text-indigo-600 hover:underline">← Kit</Link>
          <span className="text-sm text-gray-500">{currentIndex + 1} / {flashcards.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-6">
          <div className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${((currentIndex) / flashcards.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-56 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Question</p>
            <p className="text-lg font-medium">{currentCard.front}</p>
          </div>

          {!revealed ? (
            <button onClick={() => setRevealed(true)}
              className="mt-6 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
              aria-label="Reveal answer">
              Tap to reveal answer
            </button>
          ) : (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Answer</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{currentCard.back}</p>
            </div>
          )}
        </div>

        {revealed && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-center text-gray-500 mb-2">How well did you know this?</p>
            <div className="grid grid-cols-3 gap-2">
              {CONFIDENCE_CONFIG.map(({ level, label, color }) => (
                <button key={level} onClick={() => handleConfidence(level)}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${color}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-24 text-gray-400">Loading practice session...</div>
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
