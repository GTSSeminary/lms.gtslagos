import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { ArrowLeft, Video, FileText, CalendarDays } from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [notEnrolled, setNotEnrolled] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setNotEnrolled(false);
    api
      .get('/api/student/course-availability')
      .then((data) => {
        if (!active) return;
        const items = data?.items || [];
        const found = items.find((c) => String(c.course_id) === String(courseId));
        setCourse(found || { course_id: courseId, title: 'Course' });
        // "Available / Upcoming" courses are not enrolled yet — skip the calls
        // that would otherwise return 403 and just show the overview.
        if (!found || found.state === 'available') {
          if (found) setNotEnrolled(true);
          setMaterials([]);
          setSessions([]);
          setProgress(null);
          setLoading(false);
          return;
        }
        Promise.allSettled([
          api.get(`/api/student/courses/${courseId}/materials`),
          api.get(`/api/student/courses/${courseId}/sessions`),
          api.get(`/api/attendance/course/${courseId}/progress`).catch(() => null),
        ])
          .then(([mats, sess, prog]) => {
            if (!active) return;
            setMaterials(mats.status === 'fulfilled' ? mats.value || [] : []);
            setSessions(sess.status === 'fulfilled' ? sess.value || [] : []);
            if (mats.status === 'rejected' || sess.status === 'rejected') {
              const code = mats.reason?.status || sess.reason?.status;
              if (code === 403) setNotEnrolled(true);
              else setError(mats.reason?.message || sess.reason?.message || 'Failed to load course content');
            }
            setProgress(prog.status === 'fulfilled' ? prog.value : null);
          })
          .finally(() => active && setLoading(false));
      })
      .catch((e) => {
        if (!active) return;
        setError(e.message);
        setCourse({ course_id: courseId, title: 'Course' });
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
          <ArrowLeft size={16} /> Back to courses
        </Link>
        <Card>
          <p className="text-sm text-slate-500">Course not found.</p>
        </Card>
      </div>
    );
  }

  const pct = progress?.percentage != null ? Math.round(progress.percentage) : null;

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <ArrowLeft size={16} /> Back to courses
      </Link>

      {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
      {notEnrolled && (
        <div className="rounded-2xl bg-amber-50 text-amber-800 text-sm px-4 py-3">
          You are not enrolled in this course. Materials and sessions are restricted, but you can still see the course overview above.
        </div>
      )}

      <Card>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900">{course?.title}</h1>
            {course.course_code && (
              <p className="font-mono text-sm text-slate-400 mt-1">{course.course_code}</p>
            )}
          </div>
          {course.state && <Badge variant="indigo">{course.state}</Badge>}
        </div>
        {course.description && <p className="text-sm text-slate-500 mt-3">{course.description}</p>}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          {course.lecturer_name && <span>👤 {course.lecturer_name}</span>}
          {course.secondary_lecturer_name && (
            <span>👥 {course.secondary_lecturer_name}</span>
          )}
          {course.duration_weeks && <span>⏱ {course.duration_weeks} weeks</span>}
          {course.min_attendance_required && (
            <span>✓ Min attendance {course.min_attendance_required}%</span>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-slate-900">Attendance progress</h2>
          {pct != null ? (
            <span className="font-mono text-sm text-slate-600">{pct}%</span>
          ) : (
            <Badge variant="slate">N/A</Badge>
          )}
        </div>
        {pct != null ? (
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= (course.min_attendance_required || 0) ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Attendance data is not available for this course.</p>
        )}
        {progress && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 font-mono">
            {progress.present != null && <span>Present: {progress.present}</span>}
            {progress.required != null && <span>Required: {progress.required}</span>}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-indigo-500" /> Sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400">No scheduled sessions.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <div className="font-medium text-slate-800">
                    {s.class_number ? `Class ${s.class_number}` : 'Session'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {s.start_time} – {s.end_time}
                  </div>
                  {s.lecturer_notes && (
                    <div className="text-xs text-slate-400 mt-1">{s.lecturer_notes}</div>
                  )}
                </div>
                {s.meet_link && (
                  <a
                    href={s.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
                  >
                    <Video size={16} /> Join
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" /> Materials
        </h2>
        {materials.length === 0 ? (
          <p className="text-sm text-slate-400">No materials uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <div className="font-medium text-slate-800">{m.title}</div>
                  {m.description && <div className="text-xs text-slate-500">{m.description}</div>}
                  {m.section_number != null && (
                    <div className="text-xs text-slate-400 font-mono">Section {m.section_number}</div>
                  )}
                </div>
                {m.material_url && (
                  <a
                    href={m.material_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
