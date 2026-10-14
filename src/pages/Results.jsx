import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/api/results/my')
      .then((data) => active && setResults(data || []))
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
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Results</h1>
        <p className="text-slate-500 text-sm mt-1">Your exam and assignment results</p>
      </div>

      {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {results.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No results yet.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Course</th>
                  <th className="text-left font-medium px-6 py-3">Type</th>
                  <th className="text-left font-medium px-6 py-3">Score</th>
                  <th className="text-left font-medium px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, idx) => (
                  <tr key={r.course_id || idx} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-800">{r.course_code}</td>
                    <td className="px-6 py-3 text-slate-600">{r.result_type}</td>
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
  );
}
