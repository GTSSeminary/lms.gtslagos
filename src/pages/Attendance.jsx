import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/api/student/reports/me')
      .then((data) => active && setReports(data || []))
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">Your attendance vs. minimum required per course</p>
      </div>

      {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {reports.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No attendance records yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => {
            const present = r.present_count || 0;
            const absent = r.absent_count || 0;
            const required = r.min_attendance_required || 0;
            const total = present + absent;
            const pct = total > 0 ? Math.round((present / total) * 100) : null;
            return (
              <Card key={r.id || r.course_code}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-slate-900">{r.course_code}</h3>
                    {r.title && <p className="text-sm text-slate-500">{r.title}</p>}
                  </div>
                  <Badge variant={r.eligible ? 'green' : 'amber'}>
                    {r.eligible ? 'Eligible' : 'Not eligible'}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 font-mono">
                  <span>Present: {present}</span>
                  <span>Absent: {absent}</span>
                  <span>Min required: {required}%</span>
                </div>

                <div className="mt-3">
                  {pct != null ? (
                    <>
                      <div className="text-xs text-slate-400 mb-1">Attendance: {pct}%</div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= required ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <Badge variant="slate">N/A</Badge>
                  )}
                </div>

                <Link
                  to={`/courses/${r.course_id || ''}`}
                  className="inline-block mt-3 text-sm text-indigo-600 hover:underline"
                >
                  View course →
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
