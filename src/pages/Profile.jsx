import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { GraduationCap, CalendarDays } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [gradStatus, setGradStatus] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingGrad, setLoadingGrad] = useState(true);
  const [gradError, setGradError] = useState('');

  const rows = [
    { label: 'Full name', value: user?.full_name },
    { label: 'Email', value: user?.email },
    { label: 'Role', value: user?.role },
    { label: 'Matric number', value: user?.matric_no },
    { label: 'Status', value: user?.status },
  ];

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get('/api/student/graduation-status').catch(() => null),
      api.get('/api/results/my').catch(() => null),
    ])
      .then(([grad, res]) => {
        if (!active) return;
        setGradStatus(grad.status === 'fulfilled' ? grad.value || null : null);
        if (grad.status === 'rejected') setGradError(grad.reason?.message || 'Failed to load graduation info');
        setResults(res.status === 'fulfilled' ? res.value || [] : []);
      })
      .finally(() => active && setLoadingGrad(false));
    return () => {
      active = false;
    };
  }, []);

  const isGraduated =
    gradStatus &&
    (gradStatus.status === 'Graduated' ||
      gradStatus.status === 'Alumni' ||
      gradStatus.set_status === 'graduated' ||
      gradStatus.set_status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Your account details &amp; graduation record</p>
      </div>

      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-display font-bold text-xl">
            {(user?.full_name || 'S').charAt(0)}
          </div>
          <div>
            <div className="font-display font-semibold text-lg text-slate-900">{user?.full_name}</div>
            <Badge variant="indigo" className="mt-1 capitalize">
              {user?.role}
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500">{r.label}</span>
              <span className="text-sm font-medium text-slate-800">
                {r.value || <span className="text-slate-300">—</span>}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Graduation */}
      <div>
        <h2 className="font-display font-semibold text-xl text-slate-900 mb-3">Graduation</h2>

        {gradError && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3 mb-3">{gradError}</div>}

        {loadingGrad ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !gradStatus ? (
          <Card>
            <p className="text-sm text-slate-500">No graduation information available yet.</p>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="font-display font-semibold text-slate-900">
                    {gradStatus.set_name || 'Graduation Status'}
                  </div>
                  <div className="text-sm text-slate-500">Set {gradStatus.set_id || '—'}</div>
                </div>
              </div>
              <Badge variant={isGraduated ? 'green' : 'amber'}>
                {gradStatus.status || gradStatus.set_status || 'N/A'}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-400">Matric number</div>
                <div className="font-mono text-slate-800">{gradStatus.matric_no || '—'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-400">Set status</div>
                <div className="text-slate-800">{gradStatus.set_status || '—'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <CalendarDays size={14} /> Graduation date
                </div>
                <div className="font-mono text-slate-800">{gradStatus.graduation_date || 'To be announced'}</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Scorecard — shown for graduated students */}
      {isGraduated && (
        <div>
          <h2 className="font-display font-semibold text-xl text-slate-900 mb-3">Academic Scorecard</h2>
          {results.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500">No course results recorded.</p>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">Code</th>
                      <th className="text-left font-medium px-6 py-3">Course</th>
                      <th className="text-left font-medium px-6 py-3">Score</th>
                      <th className="text-left font-medium px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono text-slate-800">{r.course_code || '—'}</td>
                        <td className="px-6 py-3 text-slate-800">{r.course_title}</td>
                        <td className="px-6 py-3 font-mono text-slate-800">{r.score}</td>
                        <td className="px-6 py-3">
                          <Badge variant={r.status === 'Pass' ? 'green' : 'red'}>{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
