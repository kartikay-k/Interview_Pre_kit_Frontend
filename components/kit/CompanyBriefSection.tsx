'use client';
import { useState } from 'react';
import type { Kit } from '@/types/kit';

interface Props {
  kit: Kit;
  onSave: (patch: Partial<Kit>) => Promise<void>;
  onRegenerate: (section: string) => Promise<void>;
}

export function CompanyBriefSection({ kit, onSave, onRegenerate }: Props) {
  const brief = kit.company_brief;
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(brief?.summary || '');
  const [whatTheyDo, setWhatTheyDo] = useState(brief?.what_they_do || '');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ company_brief: { ...brief, summary, what_they_do: whatTheyDo, _state: 'edited' } as any });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try { await onRegenerate('company_brief'); }
    finally { setRegenerating(false); }
  };

  if (!brief) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Company Brief</h2>
        <div className="flex gap-2">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)}
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Edit</button>
              <button onClick={handleRegenerate} disabled={regenerating}
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
              rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">What they do</label>
            <textarea value={whatTheyDo} onChange={(e) => setWhatTheyDo(e.target.value)}
              rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-700">{brief.summary}</p>
          {brief.what_they_do && <p className="text-sm text-gray-600">{brief.what_they_do}</p>}
          {brief.sources?.length > 0 && (
            <div className="text-xs text-gray-400">
              Sources: {brief.sources.slice(0, 3).map((s, i) => (
                <a key={i} href={s} target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-indigo-600 ml-1 break-all">
                  {new URL(s).hostname}
                </a>
              ))}
            </div>
          )}
          {brief._state === 'edited' && <span className="text-xs text-purple-600">✏️ Edited</span>}
        </div>
      )}
    </div>
  );
}
