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
  // answers[examId][questionId] = text
  const [answers, setAnswers] = useState({});
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

  const setAnswer = (examId, questionId, value) => {
    setAnswers((a) => ({
      ...a,
      [examId]: { ...(a[examId] || {}), [questionId]: value },
    }));
  };

  function submitEssay(exam) {
    const id = exam.exam_id;
    const own = answers[id] || {};
    const missing = (exam.questions || []).filter((q) => !String(own[q.id] || '').trim());
    if (missing.length > 0) {
      setMessages((m) => ({
        ...m,
        [id]: `Please answer all ${exam.questions.length} question(s) — ${missing.length} left.`,
      }));
      return;
    }
    setSubmitting(id);
    setMessages((m) => ({ ...m, [id]: '' }));
    api
      .post(`/api/exams/${id}/student-submit`, {
        answers: exam.questions.reduce((acc, q) => {
          acc[q.id] = String(own[q.id] || '').trim();
          return acc;
        }, {}),
        type: 'essay',
      })
      .then(() => {
        setSubmitted((s) => ({ ...s, [id]: true }));
        setMessages((m) => ({ ...m, [id]: 'Submitted — awaiting marking.' }));
      })
      .catch((e) => {
        setMessages((m) => ({ ...m, [id]: e.message }));
      })
      .finally(() => setSubmitting(null));
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
            const id = exam.exam_id;
            const isMcq = exam.exam_type === 'mcq';
            const questions = exam.questions || [];
            const own = answers[id] || {};
            const answeredCount = questions.filter((q) => String(own[q.id] || '').trim()).length;

            return (
              <Card key={id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-slate-900">{exam.title}</h3>
                    {exam.course_title && (
                      <p className="text-xs text-slate-400 mt-0.5">{exam.course_title}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={isMcq ? 'indigo' : 'amber'}>{exam.exam_type}</Badge>
                    {!isMcq && questions.length > 0 && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                        {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                      </span>
                    )}
                  </div>
                </div>

                {exam.due_date && (
                  <p className="text-xs text-slate-400 mt-1">
                    Due: {new Date(exam.due_date).toLocaleString()}
                  </p>
                )}

                {exam.submission_score != null && (
                  <p className="text-sm text-slate-500 mt-2">
                    Score: <span className="font-mono font-medium">{exam.submission_score}</span>
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {isMcq ? (
                    <a
                      href={exam.quiz_url || (exam.public_token ? `${ADMIN_ORIGIN}/quiz/${exam.public_token}` : '#')}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
                    >
                      Take exam <ExternalLink size={16} />
                    </a>
                  ) : submitted[id] || exam.submission_id ? (
                    <Badge variant="green">Submitted</Badge>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <div key={q.id}>
                          <label
                            htmlFor={`q-${id}-${q.id}`}
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            <span className="text-slate-400 mr-1">Q{index + 1}.</span>
                            {q.question_text}
                          </label>
                          <textarea
                            id={`q-${id}-${q.id}`}
                            value={own[q.id] || ''}
                            onChange={(e) => setAnswer(id, q.id, e.target.value)}
                            rows={4}
                            placeholder="Write your answer here..."
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                      {questions.length === 0 && (
                        <p className="text-xs text-slate-400">No questions have been added to this exam yet.</p>
                      )}
                      {questions.length > 0 && (
                        <>
                          <p className="text-xs text-slate-400">
                            {answeredCount} of {questions.length} answered
                          </p>
                          <button
                            onClick={() => submitEssay(exam)}
                            disabled={submitting === id}
                            className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {submitting === id ? (
                              <Spinner className="h-4 w-4 border-white border-t-transparent" />
                            ) : (
                              <Send size={16} />
                            )}
                            Submit exam
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {messages[id] && (
                    <p className="text-xs text-slate-500 mt-2">{messages[id]}</p>
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
