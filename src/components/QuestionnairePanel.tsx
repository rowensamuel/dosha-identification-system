import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types.ts';
import { ArrowLeft, ArrowRight, ShieldCheck, Heart, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface QuestionnairePanelProps {
  token: string;
  onComplete: (assessment: any) => void;
  onCancel: () => void;
}

export default function QuestionnairePanel({ token, onComplete, onCancel }: QuestionnairePanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('ayur_assessment_current_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('ayur_assessment_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/questions');
        if (!res.ok) throw new Error('Failed to load questions');
        const data = await res.json();
        setQuestions(data);
      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Validate current index after questions load
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(questions.length - 1);
    }
  }, [questions, currentIndex]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ayur_assessment_current_index', String(currentIndex));
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('ayur_assessment_answers', JSON.stringify(answers));
  }, [answers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-ayur-green-500" />
        <p className="text-gray-500 font-display">Initializing Expert System Questions...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-4 bg-red-50 dark:bg-red-950/20 border border-red-100 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">Failed to Load Assessment</h3>
        <p className="text-sm text-gray-650 dark:text-gray-400">{loadError}</p>
        <button
          onClick={onCancel}
          className="cursor-pointer px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  const totalQuestions = questions.length;

  // Handle case where questions are not loaded yet or are empty
  if (totalQuestions === 0 && !loading) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
        <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">No Questions Available</h3>
        <p className="text-sm text-gray-650 dark:text-gray-400">There are currently no questions configured in the system. Please contact the administrator.</p>
        <button
          onClick={onCancel}
          className="cursor-pointer px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Use a validated index to make sure we never try to read from an undefined index
  const safeIndex = totalQuestions > 0 ? Math.min(Math.max(0, currentIndex), totalQuestions - 1) : 0;
  const currentQuestion = questions[safeIndex] || null;
  const progressPercent = totalQuestions > 0 ? Math.round((safeIndex / totalQuestions) * 100) : 0;
  const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
    
    // Auto advance after a brief visual feedback delay
    if (safeIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      }, 250);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const handleNext = () => {
    if (safeIndex < totalQuestions - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredQuestions = questions.filter(q => answers[q.id] === undefined);
    if (unansweredQuestions.length > 0) {
      const missingNumbers = unansweredQuestions.map(q => questions.indexOf(q) + 1).join(', ');
      setSubmitError(`Please answer all ${totalQuestions} questions before submitting. Unanswered questions: ${missingNumbers}`);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate results');

      localStorage.removeItem('ayur_assessment_current_index');
      localStorage.removeItem('ayur_assessment_answers');
      onComplete(data.assessment);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current has answer
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Questionnaire Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-display font-bold text-gray-700 dark:text-gray-300">
            {safeIndex === totalQuestions - 1 && answeredCount === totalQuestions ? "Review & Submit" : `Assessment Progress: ${progressPercent}%`}
          </span>
          <span className="font-mono text-gray-500 font-semibold bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-ayur-green-500 to-ayur-gold-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Clear Progress & Saved Indicator */}
        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 px-1 pt-1">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to restart the assessment and clear all saved answers? This action cannot be undone.")) {
                setAnswers({});
                setCurrentIndex(0);
                localStorage.removeItem('ayur_assessment_answers');
                localStorage.removeItem('ayur_assessment_current_index');
              }
            }}
            className="cursor-pointer text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors flex items-center gap-1 hover:underline"
          >
            <RefreshCw className="w-3 h-3 animate-spin-reverse" /> Restart Assessment
          </button>
          <span className="italic flex items-center gap-1 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Progress auto-saved locally
          </span>
        </div>
      </div>

      {/* Interactive Question Map Grid */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-display">Question Navigator</h4>
          <span className="text-[10px] text-gray-450 dark:text-gray-550">Click any number to jump directly</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-start md:justify-center">
          {questions.map((q, idx) => {
            const isCurrent = idx === safeIndex;
            const isAnswered = answers[q.id] !== undefined;
            
            let btnClass = "";
            if (isCurrent) {
              btnClass = "border-2 border-ayur-gold-500 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 font-black ring-2 ring-amber-500/10 scale-105";
            } else if (isAnswered) {
              btnClass = "border border-green-200 bg-green-50/70 text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300 font-semibold";
            } else {
              btnClass = "border border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-600 hover:border-gray-300 dark:hover:border-gray-750";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                title={`Question ${idx + 1}: ${q.question.substring(0, 45)}...`}
                className={`cursor-pointer w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs transition-all ${btnClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        
        {/* Map Legend */}
        <div className="flex flex-wrap justify-start md:justify-center gap-x-4 gap-y-1.5 text-[10px] text-gray-450 dark:text-gray-500 font-medium border-t border-gray-100 dark:border-gray-800/40 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-50 dark:bg-green-950/25 border border-green-400 block"></span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-50 dark:bg-amber-950/20 border-2 border-ayur-gold-500 block"></span>
            <span>Current Question</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded border border-gray-200 dark:border-gray-800 block"></span>
            <span>Unanswered</span>
          </div>
        </div>
      </div>

      {/* Main Questionnaire Area */}
      <AnimatePresence mode="wait">
        {!currentQuestion ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-ayur-green-500" />
            <p className="text-gray-500 font-display">Preparing next question...</p>
          </div>
        ) : (
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="p-8 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xl glow-green"
          >
            {/* Question Category Tag */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ayur-green-50 text-ayur-green-600 dark:bg-ayur-green-950/40 dark:text-ayur-green-300 text-xs font-bold uppercase tracking-wider font-display border border-ayur-green-100/30">
                <Sparkles className="w-3.5 h-3.5 text-ayur-gold-500 animate-spin" /> {currentQuestion.category}
              </span>
              <span className="text-xs text-gray-400 font-mono font-semibold">Q. {safeIndex + 1} / {totalQuestions}</span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold font-display text-gray-900 dark:text-white leading-snug mb-8">
              {currentQuestion.question}
            </h2>

            {/* Options List */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`cursor-pointer w-full text-left p-5 rounded-2xl border transition-all duration-200 outline-hidden flex items-center justify-between gap-4 shadow-xs ${
                      isSelected
                        ? 'border-ayur-green-500 bg-ayur-green-600 dark:bg-ayur-green-750 text-white shadow-md ring-4 ring-ayur-green-500/20'
                        : 'border-slate-800 dark:border-slate-900 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-900 hover:border-slate-700 text-slate-100 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <p className={`font-sans text-sm md:text-base font-medium ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                        {option.text}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'border-white bg-white text-ayur-green-600' : 'border-slate-500 bg-slate-800 text-slate-400'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-ayur-green-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Error Display */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-750 dark:text-red-400 text-sm flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="space-y-1">
            <p className="font-bold font-display">Validation / Submission Incomplete</p>
            <p className="text-xs leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      {/* Controller Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={safeIndex === 0}
          className="cursor-pointer px-5 py-3 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-650 dark:border-gray-800 dark:hover:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 text-sm font-semibold font-display"
        >
          <ArrowLeft className="w-4 h-4" /> Previous Question
        </button>

        {safeIndex === totalQuestions - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="cursor-pointer px-6 py-3.5 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 text-white font-bold font-display shadow-lg hover:shadow-xl hover:shadow-ayur-green-500/25 transition-all flex items-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Rules...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-ayur-gold-500" /> Complete Analysis
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={safeIndex === totalQuestions - 1 || !currentQuestion}
            className="cursor-pointer px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-semibold font-display"
          >
            Next Question <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Helpful Assessment Tip */}
      <div className="p-4 rounded-xl bg-ayur-gold-50/50 dark:bg-ayur-gold-500/5 border border-ayur-gold-500/10 text-center flex items-center justify-center gap-2">
        <Heart className="w-4 h-4 text-ayur-gold-500 animate-pulse shrink-0" />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Tip: Answer based on your lifetime traits and physical patterns rather than how you feel today.
        </p>
      </div>
    </div>
  );
}
