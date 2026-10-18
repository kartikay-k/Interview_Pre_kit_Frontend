'use client';
import type { Kit } from '@/types/kit';

interface Props {
  kit: Kit;
  onRegenerate: (section: string) => Promise<void>;
}

export function ScheduleSection({ kit, onRegenerate }: Props) {
  const schedule = kit.schedule;
  if (!schedule) return <p className="text-gray-400">No schedule generated.</p>;

  const questionMap = Object.fromEntries((kit.questions || []).map((q) => [q.id, q]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{schedule.days_available}-Day Study Schedule</h2>
        <button onClick={() => onRegenerate('schedule')} className="text-sm text-gray-500 hover:text-indigo-600">Regenerate</button>
      </div>
      {schedule.days.map((day) => (
        <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Day {day.day}</h3>
            <span className="text-sm text-gray-400">{day.minutes} min</span>
          </div>
          <p className="text-sm text-indigo-700 font-medium mb-2">{day.focus}</p>
          {day.question_ids.length > 0 ? (
            <ul className="space-y-1">
              {day.question_ids.map((qId) => {
                const q = questionMap[qId];
                return q ? (
                  <li key={qId} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                      q.category === 'technical' ? 'bg-blue-50 text-blue-700' :
                      q.category === 'behavioural' ? 'bg-purple-50 text-purple-700' :
                      q.category === 'system-design' ? 'bg-orange-50 text-orange-700' :
                      'bg-green-50 text-green-700'
                    }`}>{q.category}</span>
                    {q.prompt}
                  </li>
                ) : null;
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">Review and consolidation day</p>
          )}
        </div>
      ))}
    </div>
  );
}
