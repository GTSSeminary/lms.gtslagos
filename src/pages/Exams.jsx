import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { ExternalLink, Send } from 'lucide-react';

const ADMIN_ORIGIN = 'https://admin.gtslagos.com';

export default function Exams() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [text, setText] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    let active = true;
    api
      .get('/api/exams/my')
      .then((data) => active && setExams(data || []))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function submitEssay(exam) {
    const answer = text[exam.id] || '';
    if (!answer.trim()) return;
    setSubmitting(exam.id);
    setMessages((m) => ({ ...m, [exam.id]: '' }));
    try {
      await api.post(`/api/exams/${exam.id}/student-submit`, {
        answers: { text: answer },
        type: 'essay',
      });
      setSubmitted((s) => ({ ...s, [exam.id]: true }));
      setMessages((m) => ({ ...m, [exam.id]: 'Submitted — awaiting marking.' }));
    } catch (e) {
      setMessages((m) => ({ ...m, [exam.id]: e.message }));
    } finally {
      setSubmitting(null);
    }
  }

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
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">Exams</h1>
        <p className="text-slate-500 text-sm mt-1">MCQ quizzes open in the admin portal; essays submit here.</p>
      </div>

      {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {exams.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No exams available.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const isMcq = exam.exam_type === 'mcq';
            return (
              <Card key={exam.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-slate-900">{exam.title}</h3>
                    {exam.course_code && (
                      <p className="font-mono text-xs text-slate-400">{exam.course_code}</p>
                    )}
                  </div>
                  <Badge variant={isMcq ? 'indigo' : 'amber'}>{exam.exam_type}</Badge>
                </div>

                {exam.due_date && (
                  <p className="text-xs text-slate-400 mt-1">Due: {exam.due_date}</p>
                )}

                {exam.submission_score != null && (
                  <p className="text-sm text-slate-500 mt-2">
                    Score: <span className="font-mono font-medium">{exam.submission_score}</span>
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {isMcq ? (
                    <a
                      href={exam.public_token ? `${ADMIN_ORIGIN}/quiz/${exam.public_token}` : '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
                    >
                      Take exam <ExternalLink size={16} />
                    </a>
                  ) : submitted[exam.id] ? (
                    <Badge variant="green">Submitted</Badge>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={text[exam.id] || ''}
                        onChange={(e) => setText((t) => ({ ...t, [exam.id]: e.target.value }))}
                        rows={4}
                        placeholder="Write your essay answer here..."
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => submitEssay(exam)}
                        disabled={submitting === exam.id}
                        className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {submitting === exam.id ? (
                          <Spinner className="h-4 w-4 border-white border-t-transparent" />
                        ) : (
                          <Send size={16} />
                        )}
                        Submit
                      </button>
                    </div>
                  )}
                  {messages[exam.id] && (
                    <p className="text-xs text-slate-500 mt-2">{messages[exam.id]}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
