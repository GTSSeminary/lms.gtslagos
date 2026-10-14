import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const groups = [
  { key: 'active', label: 'Active', variant: 'green', empty: 'No active courses right now.' },
  { key: 'available', label: 'Available / Upcoming', variant: 'indigo', empty: 'No available or upcoming courses.' },
  { key: 'completed', label: 'Completed', variant: 'slate', empty: 'No completed courses yet.' },
  { key: 'failed', label: 'Outstanding', variant: 'red', empty: 'No outstanding courses.' },
];

const stateBadge = {
  active: 'green',
  completed: 'slate',
  failed: 'red',
  available: 'indigo',
};

export default function Courses() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/api/student/course-availability')
      .then((data) => active && setItems(data?.items || []))
      .catch((e) => active && setError(e.message))
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

  const byState = (state) => items.filter((i) => i.state === state);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Courses</h1>
        <p className="text-slate-500 text-sm mt-1">Your enrollment across all study sets</p>
      </div>

      {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {groups.map((g) => {
        const list = byState(g.key);
        return (
          <section key={g.key}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-display font-semibold text-lg text-slate-800">{g.label}</h2>
              <Badge variant={g.variant}>{list.length}</Badge>
            </div>
            {list.length === 0 ? (
              <p className="text-sm text-slate-400">{g.empty}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((c) => (
                  <Link key={c.course_id} to={`/courses/${c.course_id}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold text-slate-900">{c.title}</h3>
                        <Badge variant={stateBadge[c.state] || 'slate'}>{c.state}</Badge>
                      </div>
                      {c.course_code && (
                        <p className="font-mono text-xs text-slate-400 mt-1">{c.course_code}</p>
                      )}
                      {c.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{c.description}</p>
                      )}
                      <div className="mt-3 text-xs text-slate-400">
                        {c.start_date && <span>{c.start_date}</span>}
                        {c.start_date && c.end_date && <span> – </span>}
                        {c.end_date && <span>{c.end_date}</span>}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
