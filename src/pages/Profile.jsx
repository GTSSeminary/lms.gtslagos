import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function Profile() {
  const { user } = useAuth();

  const rows = [
    { label: 'Full name', value: user?.full_name },
    { label: 'Email', value: user?.email },
    { label: 'Role', value: user?.role },
    { label: 'Matric number', value: user?.matric_no },
    { label: 'Status', value: user?.status },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Your account details</p>
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
    </div>
  );
}
