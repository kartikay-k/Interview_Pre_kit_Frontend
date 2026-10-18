'use client';
import { useState } from 'react';
import type { Kit, Flashcard } from '@/types/kit';

interface Props {
  kit: Kit;
  onSave: (patch: Partial<Kit>) => Promise<void>;
}

export function FlashcardsSection({ kit, onSave }: Props) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(kit.flashcards || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ front: string; back: string }>({ front: '', back: '' });
  const [saving, setSaving] = useState(false);

  const save = async (updated: Flashcard[]) => {
    setSaving(true);
    try { await onSave({ flashcards: updated }); setFlashcards(updated); }
    finally { setSaving(false); }
  };

  const startEdit = (fc: Flashcard) => {
    setEditingId(fc.id);
    setEditValues({ front: fc.front, back: fc.back });
  };

  const confirmEdit = async (fc: Flashcard) => {
    const updated = flashcards.map((x) =>
      x.id === fc.id ? { ...x, ...editValues, _state: 'edited' as const } : x
    );
    await save(updated);
    setEditingId(null);
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Delete this flashcard?')) return;
    await save(flashcards.filter((f) => f.id !== id));
  };

  const addCard = async () => {
    const newId = `f${Date.now()}`;
    const newCard: Flashcard = { id: newId, front: 'New card', back: '', requirement_ids: [], _state: 'pinned' };
    const updated = [...flashcards, newCard];
    await save(updated);
    setEditingId(newId);
    setEditValues({ front: '', back: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Flashcards <span className="text-gray-400 font-normal text-sm">({flashcards.length})</span></h2>
        <button onClick={addCard} className="text-sm text-indigo-600 hover:underline">+ Add card</button>
      </div>

      {flashcards.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No flashcards yet</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {flashcards.map((fc) => (
            <div key={fc.id} className={`border rounded-lg p-3 ${fc._state === 'pinned' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100'}`}>
              {editingId === fc.id ? (
                <div className="space-y-2">
                  <input value={editValues.front} onChange={(e) => setEditValues({ ...editValues, front: e.target.value })}
                    placeholder="Front (question/concept)" className="w-full border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  <textarea value={editValues.back} onChange={(e) => setEditValues({ ...editValues, back: e.target.value })}
                    rows={3} placeholder="Back (answer/key points)" className="w-full border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  <div className="flex gap-2">
                    <button onClick={() => confirmEdit(fc)} disabled={saving}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{fc.front}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{fc.back}</p>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => startEdit(fc)} className="text-xs text-gray-400 hover:text-indigo-600">Edit</button>
                    <button onClick={() => deleteCard(fc.id)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
                    {fc._state === 'edited' && <span className="text-xs text-purple-600">✏️</span>}
                    {fc._state === 'pinned' && <span className="text-xs text-indigo-600">📌</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
