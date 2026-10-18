'use client';
import type { Kit } from '@/types/kit';

export function KitProgress({ kit }: { kit: Kit }) {
  const isFailed = kit.status === 'failed';

  return (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      {isFailed ? (
        <>
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Generation failed</h2>
          <p className="text-gray-500 text-sm">{kit.error || 'An unexpected error occurred.'}</p>
        </>
      ) : (
        <>
          <div className="text-4xl mb-3 animate-pulse">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Building your kit…</h2>
          <p className="text-gray-500 text-sm mb-4">{kit.progress?.step || 'Starting…'}</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-sm mx-auto">
            <div
              className="h-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${kit.progress?.percent || 5}%` }}
              role="progressbar"
              aria-valuenow={kit.progress?.percent || 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{kit.progress?.percent || 0}%</p>
        </>
      )}
    </div>
  );
}
