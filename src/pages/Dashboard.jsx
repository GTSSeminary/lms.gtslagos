import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import {
  BookOpen,
  CalendarCheck,
  Award,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ active: 0, eligible: 0, total: 0, grad: null });

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/student/course-availability'),
      api.get('/api/student/reports/me'),
      api.get('/api/student/graduation-status').catch(() => null),
    ])
      .then(([avail, reports, grad]) => {
        if (!active) return;
        const items = avail?.items || [];
        const activeCount = items.filter((i) => i.state === 'active').length;
        const eligible = (reports || []).filter((r) => r.eligible).length;
        setData({
          active: activeCount,
          eligible,
          total: reports?.length || 0,
          grad: grad || null,
        });
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      to: '/courses',
      icon: BookOpen,
      label: 'Active courses',
      value: data.active,
      tint: 'bg-indigo-50 text-indigo-600',
    },
    {
      to: '/attendance',
      icon: CalendarCheck,
      label: 'Attendance eligible',
      value: `${data.eligible}/${data.total}`,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      to: '/graduation',
      icon: Award,
      label: 'Graduation',
      value: data.grad?.status || 'N/A',
      tint: 'bg-amber-50 text-amber-600',
    },
  ];

  const quickLinks = [
    { to: '/study-guide', label: 'Study Guide' },
    { to: '/courses', label: 'Courses' },
    { to: '/exams', label: 'Exams' },
    { to: '/results', label: 'Results' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/graduation', label: 'Graduation' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">
          Hello, {user?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-slate-500 text-sm capitalize">Welcome to your {user?.role} portal</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(({ to, icon: Icon, label, value, tint }) => (
              <Link key={to} to={to}>
                <Card className="hover:shadow-md transition-shadow">
                  <div className={`h-11 w-11 rounded-2xl ${tint} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <div className="text-2xl font-display font-bold text-slate-900">{value}</div>
                  <div className="text-sm text-slate-500">{label}</div>
                </Card>
              </Link>
            ))}
          </div>

          {data.grad && (
            <Card className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Graduation status</div>
                  <div className="text-sm text-slate-500">
                    {data.grad.set_name ? `${data.grad.set_name}` : 'No active set'}
                  </div>
                </div>
              </div>
              <Badge variant={data.grad.status === 'eligible' ? 'green' : 'amber'}>
                {data.grad.status || 'N/A'}
              </Badge>
            </Card>
          )}

          <Card>
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4">Quick links</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 hover:bg-indigo-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors"
                >
                  {label}
                  <ArrowRight size={16} className="text-indigo-500" />
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
