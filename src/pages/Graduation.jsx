import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { GraduationCap, CalendarDays } from 'lucide-react';

export default function Graduation() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/api/student/graduation-status')
      .then((data) => active && setStatus(data || null))
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
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Graduation</h1>
        <p className="text-slate-500 text-sm mt-1">Your graduation eligibility and set information</p>
      </div>

      {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {!status ? (
        <Card>
          <p className="text-sm text-slate-500">No graduation information available.</p>
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
                  {status.set_name || 'Graduation Status'}
                </div>
                <div className="text-sm text-slate-500">Set {status.set_id || '—'}</div>
              </div>
            </div>
            <Badge variant={status.status === 'eligible' ? 'green' : 'amber'}>
              {status.status || 'N/A'}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Matric number</div>
              <div className="font-mono text-slate-800">{status.matric_no || '—'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Set status</div>
              <div className="text-slate-800">{status.set_status || '—'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <CalendarDays size={14} /> Graduation date
              </div>
              <div className="font-mono text-slate-800">{status.graduation_date || 'To be announced'}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
