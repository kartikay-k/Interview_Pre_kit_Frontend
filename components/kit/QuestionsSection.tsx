'use client';
import { useState } from 'react';
import type { Kit, Question, QuestionCategory } from '@/types/kit';

const CATEGORIES: QuestionCategory[] = ['technical', 'behavioural', 'system-design', 'company-fit'];
const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  technical: 'Technical', behavioural: 'Behavioural', 'system-design': 'System Design', 'company-fit': 'Company Fit',
};

interface Props {
  kit: Kit;
  onSave: (patch: Partial<Kit>) => Promise<void>;
  onRegenerate: (section: string) => Promise<void>;
}

function difficultyDots(d: number) {
  return Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={`inline-block w-2 h-2 rounded-full ${i < d ? 'bg-orange-400' : 'bg-gray-200'}`} />
  ));
}

export function QuestionsSection({ kit, onSave, onRegenerate }: Props) {
  const [questions, setQuestions] = useState<Question[]>(kit.questions || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Question>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = questions.filter((q) => q.category === cat);
    return acc;
  }, {} as Record<QuestionCategory, Question[]>);

  const save = async (updated: Question[]) => {
    setSaving(true);
    try { await onSave({ questions: updated }); setQuestions(updated); }
    finally { setSaving(false); }
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditValues({ prompt: q.prompt, answer_outline: q.answer_outline, difficulty: q.difficulty });
  };

  const confirmEdit = async (q: Question) => {
    const updated = questions.map((x) =>
      x.id === q.id ? { ...x, ...editValues, _state: 'edited' as const } : x
    );
    await save(updated);
    setEditingId(null);
  };

  const deleteQ = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await save(questions.filter((q) => q.id !== id));
  };

  const addQuestion = async (category: QuestionCategory) => {
    const newId = `q${Date.now()}`;
    const newQ: Question = { id: newId, requirement_ids: [], category, prompt: 'New question', answer_outline: '', difficulty: 2, _state: 'pinned' };
    const updated = [...questions, newQ];
    await save(updated);
    setEditingId(newId);
    setEditValues({ prompt: '', answer_outline: '', difficulty: 2 });
  };

  const moveCategory = async (q: Question, newCat: QuestionCategory) => {
    const updated = questions.map((x) => x.id === q.id ? { ...x, category: newCat, _state: 'edited' as const } : x);
    await save(updated);
  };

  const pinQ = async (q: Question) => {
    const updated = questions.map((x) => x.id === q.id ? { ...x, _state: x._state === 'pinned' ? 'generated' as const : 'pinned' as const } : x);
    await save(updated);
  };

  const regenCategory = async (cat: QuestionCategory) => {
    setRegenerating(cat);
    try { await onRegenerate(`questions:${cat}`); }
    finally { setRegenerating(null); }
  };

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => {
        const catQs = grouped[cat];
        return (
          <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{CATEGORY_LABEL[cat]} <span className="text-gray-400 font-normal text-sm">({catQs.length})</span></h3>
              <div className="flex gap-2">
                <button onClick={() => addQuestion(cat)} className="text-sm text-indigo-600 hover:underline">+ Add</button>
                <button onClick={() => regenCategory(cat)} disabled={regenerating === cat}
                  className="text-sm text-gray-500 hover:text-indigo-600 disabled:opacity-50">
                  {regenerating === cat ? 'Regenerating…' : 'Regenerate'}
                </button>
              </div>
            </div>

            {catQs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No {cat} questions yet</p>
            ) : (
              <div className="space-y-3">
                {catQs.map((q) => (
                  <div key={q.id} className={`border rounded-lg p-3 ${q._state === 'pinned' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100'}`}>
                    {editingId === q.id ? (
                      <div className="space-y-2">
                        <textarea value={editValues.prompt} onChange={(e) => setEditValues({ ...editValues, prompt: e.target.value })}
                          rows={2} placeholder="Question prompt" className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                        <textarea value={editValues.answer_outline} onChange={(e) => setEditValues({ ...editValues, answer_outline: e.target.value })}
                          rows={3} placeholder="Answer outline / key points" className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-gray-500">Difficulty:
                            <select value={editValues.difficulty} onChange={(e) => setEditValues({ ...editValues, difficulty: Number(e.target.value) as 1|2|3 })}
                              className="ml-1 border rounded px-1 text-sm">
                              <option value={1}>1 – Easy</option>
                              <option value={2}>2 – Medium</option>
                              <option value={3}>3 – Hard</option>
                            </select>
                          </label>
                          <label className="text-xs text-gray-500">Category:
                            <select value={cat} onChange={(e) => moveCategory(q, e.target.value as QuestionCategory)}
                              className="ml-1 border rounded px-1 text-sm">
                              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                            </select>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => confirmEdit(q)} disabled={saving}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-sm text-gray-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                            {q.prompt}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {difficultyDots(q.difficulty)}
                          </div>
                        </div>
                        {expandedId === q.id && q.answer_outline && (
                          <p className="text-xs text-gray-500 mt-2 border-t pt-2 whitespace-pre-line">{q.answer_outline}</p>
                        )}
                        <div className="flex gap-3 mt-2">
                          <button onClick={() => startEdit(q)} className="text-xs text-gray-400 hover:text-indigo-600">Edit</button>
                          <button onClick={() => pinQ(q)} className={`text-xs ${q._state === 'pinned' ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}>
                            {q._state === 'pinned' ? '📌 Pinned' : 'Pin'}
                          </button>
                          <button onClick={() => deleteQ(q.id)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
                          {q._state === 'edited' && <span className="text-xs text-purple-600">✏️</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
