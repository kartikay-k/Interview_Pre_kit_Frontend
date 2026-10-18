'use client';
import type { Kit } from '@/types/kit';

export function RoleSection({ kit }: { kit: Kit }) {
  const role = kit.role;
  if (!role) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{role.title}</h2>
          {role.seniority && <p className="text-sm text-gray-500 capitalize">{role.seniority}</p>}
          {kit.source?.location && <p className="text-sm text-gray-400">{kit.source.location}</p>}
        </div>
        <span className="text-sm text-gray-400">{kit.daysAvailable} day{kit.daysAvailable !== 1 ? 's' : ''} to prepare</span>
      </div>

      {role.responsibilities.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Responsibilities</h3>
          <ul className="list-disc list-inside space-y-1">
            {role.responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-gray-600">{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Requirements</h3>
        <div className="space-y-2">
          {role.requirements.map((req) => (
            <div key={req.id} className="flex items-start gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                req.priority === 'must' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {req.priority}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                req.kind === 'technical' ? 'bg-blue-50 text-blue-700' :
                req.kind === 'behavioural' ? 'bg-purple-50 text-purple-700' :
                'bg-orange-50 text-orange-700'
              }`}>
                {req.kind}
              </span>
              <span className="text-sm text-gray-700">{req.text}</span>
            </div>
          ))}
        </div>
      </div>

      {kit.coverage && kit.coverage.uncovered_requirement_ids.length > 0 && (
        <div className="mt-4 bg-yellow-50 rounded-lg p-3">
          <p className="text-sm text-yellow-800 font-medium">⚠️ {kit.coverage.uncovered_requirement_ids.length} requirement(s) not covered by questions</p>
        </div>
      )}
    </div>
  );
}
