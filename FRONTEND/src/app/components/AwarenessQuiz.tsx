import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, XCircle, Trophy, LogIn } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { getQuizQuestions, submitQuiz, type QuizQuestion, type QuizOption } from '@/app/api/quiz';
import { getStoredAuth } from '@/app/api/auth';

type QuestionResult = { correct: boolean; selectedId: number; correctId: number };

export function AwarenessQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [questionResults, setQuestionResults] = useState<Record<number, QuestionResult>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number; feedback: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuizQuestions()
      .then((data) => {
        const list = data.questions || [];
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }
        setQuestions(list);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const getCorrectOptionId = (opts: QuizOption[]): number => {
    const o = opts.find((x) => x.is_correct);
    return o ? o.id : opts[0]?.id ?? 0;
  };

  const handleSubmitAnswer = () => {
    if (currentQuestion == null || selectedOptionId == null) return;
    const correctId = getCorrectOptionId(currentQuestion.options);
    const correct = selectedOptionId === correctId;
    setQuestionResults((prev) => ({
      ...prev,
      [currentQuestion.id]: { correct, selectedId: selectedOptionId, correctId },
    }));
    setAnswers((prev) => ({ ...prev, [String(currentQuestion.id)]: selectedOptionId }));
    setAnswerSubmitted(true);
  };

  const handleNext = async () => {
    if (!answerSubmitted) return;
    if (isLastQuestion) {
      setSubmitting(true);
      try {
        const data = await submitQuiz({ ...answers, [String(currentQuestion!.id)]: selectedOptionId! });
        setResult(data);
        setSubmitted(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Submit failed');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOptionId(null);
    setAnswerSubmitted(false);
  };

  const optionStyle = (opt: QuizOption, qResult: QuestionResult | undefined) => {
    if (!qResult) {
      const selected = selectedOptionId === opt.id;
      return selected
        ? 'bg-[#00d9ff]/20 border-[#00d9ff]/50 text-white'
        : 'bg-[#0a0e27]/50 border-[#00d9ff]/20 text-gray-300 hover:border-[#00d9ff]/40';
    }
    const isCorrect = opt.is_correct;
    const wasSelected = qResult.selectedId === opt.id;
    if (isCorrect) return 'bg-[#00ff41]/20 border-[#00ff41]/50 text-[#00ff41]';
    if (wasSelected) return 'bg-[#ff3b3b]/20 border-[#ff3b3b]/50 text-[#ff3b3b]';
    return 'bg-[#0a0e27]/30 border-white/10 text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 pb-12 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0 && !error) {
    return (
      <div className="min-h-screen pt-24 px-6 pb-12 flex items-center justify-center">
        <p className="text-gray-400">No quiz questions available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {!getStoredAuth() && (
            <div className="mb-6 p-4 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/30 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-300">
              <span>Sign in to save your quiz score and view history.</span>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-[#00d9ff] hover:underline font-medium">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            </div>
          )}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00d9ff]/20 to-[#00ff41]/20 mb-6">
              <BookOpen className="w-10 h-10 text-[#00d9ff]" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Awareness <span className="text-[#00d9ff]">Quiz</span>
            </h1>
            <p className="text-xl text-gray-400">Test your knowledge about digital fraud</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-[#1a1f3a]/50 border-2 border-[#00ff41]/30 text-center"
            >
              <Trophy className="w-16 h-16 text-[#00ff41] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete</h2>
              <p className="text-4xl font-bold text-[#00d9ff] mb-6">
                {result?.score}/{result?.total} ({result?.percentage}%)
              </p>
              {result?.feedback && result.feedback.length > 0 && (
                <div className="mb-6 text-left">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#ffd93d]" />
                    Tips from wrong answers
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    {result.feedback.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00ff41] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => {
                    setCurrentIndex(0);
                    setSelectedOptionId(null);
                    setAnswerSubmitted(false);
                    setQuestionResults({});
                    setAnswers({});
                    setSubmitted(false);
                    setResult(null);
                    setError('');
                  }}
                  className="px-6 py-3 bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30 rounded-lg hover:bg-[#00d9ff]/30"
                >
                  Retry Quiz
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg font-semibold"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          ) : (
            currentQuestion && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-6">{currentQuestion.question}</h2>
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt) => {
                      const qResult = questionResults[currentQuestion.id];
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={answerSubmitted}
                          onClick={() => !answerSubmitted && setSelectedOptionId(opt.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${optionStyle(opt, qResult)}`}
                        >
                          {answerSubmitted && (
                            <>
                              {opt.is_correct ? (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                              ) : questionResults[currentQuestion.id]?.selectedId === opt.id ? (
                                <XCircle className="w-5 h-5 flex-shrink-0" />
                              ) : null}
                            </>
                          )}
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                  {answerSubmitted && currentQuestion.explanation && !questionResults[currentQuestion.id]?.correct && (
                    <div className="mt-4 p-4 rounded-xl bg-[#ffd93d]/10 border border-[#ffd93d]/30 text-gray-300 text-sm">
                      {currentQuestion.explanation}
                    </div>
                  )}
                  <div className="mt-8 flex justify-end gap-3">
                    {!answerSubmitted ? (
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOptionId == null}
                        className="px-6 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg font-semibold disabled:opacity-50"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={submitting}
                        className="px-6 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg font-semibold disabled:opacity-50"
                      >
                        {submitting
                          ? 'Submitting...'
                          : isLastQuestion
                            ? 'See Results'
                            : 'Next Question'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
