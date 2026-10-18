'use client';
import { useState } from 'react';
import api from '@/lib/api';

interface Props {
  onCreated: (kitId: string) => void;
}

export function CreateKitForm({ onCreated }: Props) {
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/kits', { jobDescription, companyUrl, daysAvailable });
      onCreated(data.kitId);
    } catch (err: any) {
      if (err.response?.status === 409) {
        onCreated(err.response.data.kitId);
        return;
      }
      setError(err.response?.data?.error?.message || 'Failed to create kit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="font-semibold text-lg">New Interview Kit</h2>
      {error && <div role="alert" className="bg-red-50 text-red-700 rounded p-3 text-sm">{error}</div>}
      <div>
        <label htmlFor="jd" className="block text-sm font-medium mb-1">Job Description</label>
        <textarea
          id="jd" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
          required rows={8} placeholder="Paste the full job description here…"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-1">Company Website</label>
        <input
          id="url" type="url" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)}
          required placeholder="https://company.com"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
      <div>
        <label htmlFor="days" className="block text-sm font-medium mb-1">
          Days until interview: <span className="text-indigo-600 font-semibold">{daysAvailable}</span>
        </label>
        <input
          id="days" type="range" min={1} max={60} value={daysAvailable}
          onChange={(e) => setDaysAvailable(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 day</span><span>60 days</span></div>
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating kit…' : 'Generate Kit'}
      </button>
    </form>
  );
}
