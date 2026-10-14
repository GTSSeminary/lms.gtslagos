import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const stateVariant = {
  active: 'green',
  completed: 'slate',
  failed: 'red',
  available: 'indigo',
};

export default function StudyGuide() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [states, setStates] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/student/study-guide'),
      api.get('/api/student/course-availability').catch(() => null),
    ])
      .then(([guide, avail]) => {
        if (!active) return;
        setPlan(guide?.plan || null);
        setItems(guide?.items || []);
        const map = {};
        (avail?.items || []).forEach((i) => {
          map[i.course_id] = i.state;
        });
        setStates(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Study Guide</h1>
        {plan ? (
          <p className="text-slate-500 text-sm mt-1">
            {plan.name} {plan.year ? `· ${plan.year}` : ''}
          </p>
        ) : (
          <p className="text-slate-500 text-sm mt-1">No active study plan assigned.</p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {items.length === 0 ? (
        <Card>
          <p className="text-slate-500 text-sm">Your study guide is empty.</p>
        </Card>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-4">
            {items.map((item, idx) => {
              const state = states[item.course_id];
              return (
                <div key={item.course_id || idx} className="relative">
                  <div className="absolute -left-4 top-7 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                  <Card>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-semibold text-slate-900">{item.title}</h3>
                          {item.course_code && (
                            <span className="font-mono text-xs text-slate-400">
                              {item.course_code}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      {state && (
                        <Badge variant={stateVariant[state] || 'slate'}>{state}</Badge>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                      {item.lecturer_name && <span>👤 {item.lecturer_name}</span>}
                      {item.duration_weeks && <span>⏱ {item.duration_weeks} weeks</span>}
                      {item.min_attendance_required && (
                        <span>✓ Min attendance {item.min_attendance_required}%</span>
                      )}
                      {item.start_date && <span>📅 {item.start_date}</span>}
                      {item.end_date && <span>– {item.end_date}</span>}
                    </div>
                    {item.notes && (
                      <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-2xl px-4 py-3">
                        {item.notes}
                      </div>
                    )}
                    {item.meet_link && (
                      <a
                        href={item.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 text-sm text-indigo-600 hover:underline"
                      >
                        Join class →
                      </a>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
