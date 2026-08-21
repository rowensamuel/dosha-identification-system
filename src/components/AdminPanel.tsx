import React, { useState, useEffect } from 'react';
import { Question, Recommendation, AdminStats } from '../types.ts';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from 'recharts';
import { ShieldAlert, Plus, Edit, Trash2, Save, FileText, Check, Settings, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  token: string;
}

export default function AdminPanel({ token }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active sub-tab inside admin: 'stats' | 'questions' | 'recommendations'
  const [subTab, setSubTab] = useState<'stats' | 'questions' | 'recommendations'>('stats');

  // Question Form State
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [qText, setQText] = useState('');
  const [qCategory, setQCategory] = useState('Physical Characteristics');
  const [qVataText, setQVataText] = useState('');
  const [qPittaText, setQPittaText] = useState('');
  const [qKaphaText, setQKaphaText] = useState('');

  // Recommendation Edit Form State
  const [editingRecId, setEditingRecId] = useState<number | null>(null);
  const [recEat, setRecEat] = useState('');
  const [recAvoid, setRecAvoid] = useState('');
  const [recExercise, setRecExercise] = useState('');
  const [recYoga, setRecYoga] = useState('');
  const [recMeditation, setRecMeditation] = useState('');
  const [recSleep, setRecSleep] = useState('');

  // Premium Custom Notifications & Confirmation states
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error('Failed to load administrator statistics.');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Questions
      const questionsRes = await fetch('/api/questions');
      if (questionsRes.ok) {
        const qData = await questionsRes.json();
        setQuestions(qData);
      }

      // 3. Recommendations
      const recsRes = await fetch('/api/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (recsRes.ok) {
        const recData = await recsRes.json();
        setRecommendations(recData);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // CRUD Questions
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qVataText.trim() || !qPittaText.trim() || !qKaphaText.trim()) {
      showNotification('Please fill out all choice fields.', 'error');
      return;
    }

    const payload = {
      question: qText,
      category: qCategory,
      options: [
        { text: qVataText, type: 'vata', value: 2 },
        { text: qPittaText, type: 'pitta', value: 2 },
        { text: qKaphaText, type: 'kapha', value: 2 },
      ]
    };

    try {
      if (editingQuestionId) {
        // Edit Mode
        const res = await fetch(`/api/questions/${editingQuestionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update question');
        
        const data = await res.json();
        setQuestions(prev => prev.map(q => q.id === editingQuestionId ? data.question : q));
        showNotification('Question updated successfully!', 'success');
      } else {
        // Create Mode
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create question');
        
        const data = await res.json();
        setQuestions(prev => [...prev, data.question]);
        showNotification('Question created successfully!', 'success');
      }

      // Reset
      setEditingQuestionId(null);
      setQText('');
      setQVataText('');
      setQPittaText('');
      setQKaphaText('');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleEditQuestionClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setQText(q.question);
    setQCategory(q.category);
    
    const vataOpt = q.options.find(o => o.type === 'vata');
    const pittaOpt = q.options.find(o => o.type === 'pitta');
    const kaphaOpt = q.options.find(o => o.type === 'kapha');

    setQVataText(vataOpt ? vataOpt.text : '');
    setQPittaText(pittaOpt ? pittaOpt.text : '');
    setQKaphaText(kaphaOpt ? kaphaOpt.text : '');

    // Pristine UX Auto-scroll & Auto-focus
    setTimeout(() => {
      document.getElementById('question-input')?.focus();
      document.getElementById('question-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const executeDeleteQuestion = async (id: number) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete question');
      
      setQuestions(prev => prev.filter(q => q.id !== id));
      showNotification('Question deleted successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // CRUD Recommendations
  const handleEditRecClick = (r: Recommendation) => {
    setEditingRecId(r.id);
    setRecEat(r.diet_eat.join('\n'));
    setRecAvoid(r.diet_avoid.join('\n'));
    setRecExercise(r.exercise.join('\n'));
    setRecYoga(r.yoga.join('\n'));
    setRecMeditation(r.meditation);
    setRecSleep(r.sleep_advice);
  };

  const handleSaveRec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecId) return;

    const payload = {
      diet_eat: recEat.split('\n').filter(line => line.trim() !== ''),
      diet_avoid: recAvoid.split('\n').filter(line => line.trim() !== ''),
      exercise: recExercise.split('\n').filter(line => line.trim() !== ''),
      yoga: recYoga.split('\n').filter(line => line.trim() !== ''),
      meditation: recMeditation,
      sleep_advice: recSleep,
    };

    try {
      const res = await fetch(`/api/recommendations/${editingRecId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update recommendations');
        
        const data = await res.json();
        setRecommendations(prev => prev.map(r => r.id === editingRecId ? data.recommendation : r));
        showNotification('Recommendations updated successfully!', 'success');
        setEditingRecId(null);
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-ayur-green-500" />
        <p className="text-gray-500 font-display">Loading Administrator Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center max-w-md mx-auto bg-red-50 text-red-700 border border-red-100 rounded-2xl">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  const COLORS = ['#06b6d4', '#f97316', '#10b981', '#a855f7', '#ec4899'];

  const getDoshaColor = (name: string): string => {
    const normalized = name.toLowerCase();
    if (normalized === 'vata') return '#06b6d4'; // Cyan
    if (normalized === 'pitta') return '#f97316'; // Orange/Warm Gold
    if (normalized === 'kapha') return '#10b981'; // Green
    if (normalized === 'tridoshic') return '#a855f7'; // Purple
    
    // Dual combinations
    if (normalized.includes('vata') && normalized.includes('pitta')) return '#0ea5e9'; // Blue-Orange blend
    if (normalized.includes('pitta') && normalized.includes('kapha')) return '#f59e0b'; // Gold-Green blend
    if (normalized.includes('vata') && normalized.includes('kapha')) return '#14b8a6'; // Cyan-Green blend
    
    return '#6b7280'; // Fallback gray
  };

  return (
    <div className="space-y-12">
      {/* Admin Title Banner */}
      <div className="flex items-center gap-3 p-6 rounded-3xl bg-linear-to-r from-red-50 to-amber-50 dark:from-red-950/20 dark:to-transparent border border-red-100 dark:border-red-900/30">
        <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 animate-bounce" />
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
            Administrator Command Dashboard
          </h2>
          <p className="text-sm text-gray-500">Live analytics, Question Bank management, and Knowledge Base tuning</p>
        </div>
      </div>

      {/* Sub tabs nav */}
      <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-md">
        <button
          onClick={() => setSubTab('stats')}
          className={`cursor-pointer flex-1 py-2.5 rounded-lg text-xs font-bold font-display transition-all ${
            subTab === 'stats' ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
          }`}
        >
          Analytics Summary
        </button>
        <button
          onClick={() => setSubTab('questions')}
          className={`cursor-pointer flex-1 py-2.5 rounded-lg text-xs font-bold font-display transition-all ${
            subTab === 'questions' ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
          }`}
        >
          Manage Questions ({questions.length})
        </button>
        <button
          onClick={() => setSubTab('recommendations')}
          className={`cursor-pointer flex-1 py-2.5 rounded-lg text-xs font-bold font-display transition-all ${
            subTab === 'recommendations' ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
          }`}
        >
          Recommendations Base
        </button>
      </div>

      {/* Admin Content Panels */}
      {subTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-150 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">Total Registered</span>
              <h4 className="text-4xl font-extrabold font-display text-gray-900 dark:text-white mt-2">{stats.totalUsers} Members</h4>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-gray-150 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">Total Rule Computations</span>
              <h4 className="text-4xl font-extrabold font-display text-gray-900 dark:text-white mt-2">{stats.totalAssessments} Assessments</h4>
            </div>
          </div>

          {/* Graphics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pie distribution of dominant doshas */}
            <div className="p-6 rounded-3xl bg-white border border-gray-150 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <h4 className="text-base font-bold font-display text-gray-900 dark:text-white mb-6">Dominant Constitution Splits</h4>
              <div className="h-[250px] flex items-center justify-center">
                {stats.doshaDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.doshaDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {stats.doshaDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getDoshaColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-400">Waiting for user assessments to analyze splits...</p>
                )}
              </div>
            </div>

            {/* Average Dosha Scores */}
            <div className="p-6 rounded-3xl bg-white border border-gray-150 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <h4 className="text-base font-bold font-display text-gray-900 dark:text-white mb-6">Average Elements Density (Vata/Pitta/Kapha)</h4>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Vata', value: stats.averageScores.Vata, color: '#06b6d4' },
                      { name: 'Pitta', value: stats.averageScores.Pitta, color: '#f97316' },
                      { name: 'Kapha', value: stats.averageScores.Kapha, color: '#10b981' }
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2c5e43">
                      <Cell fill="#06b6d4" />
                      <Cell fill="#f97316" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'questions' && (
        <div className="space-y-8">
          {/* Question Add/Edit Form */}
          <form id="question-form-top" onSubmit={handleSaveQuestion} className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-xs space-y-4">
            <h4 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-ayur-gold-500" /> {editingQuestionId ? 'Modify Question' : 'Add New Question'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Question Title</label>
                <input
                  id="question-input"
                  type="text"
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  placeholder="e.g. Describe your typical sleep quality:"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden dark:bg-gray-950 dark:text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Question Category</label>
                <select
                  value={qCategory}
                  onChange={e => setQCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden dark:bg-gray-950 dark:text-white text-sm"
                >
                  <option value="Physical Characteristics">Physical Characteristics</option>
                  <option value="Physiological Traits">Physiological Traits</option>
                  <option value="Psychological Traits">Psychological Traits</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h5 className="text-xs font-bold text-gray-500 font-mono uppercase tracking-widest">Multiple Choice Mappings (Vata/Pitta/Kapha Option Values)</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 p-4 rounded-xl border border-cyan-100 bg-cyan-50/20 dark:bg-cyan-950/5">
                  <label className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Vata Choice (A)</label>
                  <input
                    type="text"
                    value={qVataText}
                    onChange={e => setQVataText(e.target.value)}
                    placeholder="Dry, light sleep, waking up..."
                    className="w-full px-3 py-2 rounded-lg border border-cyan-200 dark:border-cyan-900 bg-white dark:bg-gray-950 outline-hidden text-xs"
                  />
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-orange-100 bg-orange-50/20 dark:bg-orange-950/5">
                  <label className="text-xs font-bold text-orange-600 dark:text-orange-400">Pitta Choice (B)</label>
                  <input
                    type="text"
                    value={qPittaText}
                    onChange={e => setQPittaText(e.target.value)}
                    placeholder="Moderate sound sleep, feels hot..."
                    className="w-full px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-900 bg-white dark:bg-gray-950 outline-hidden text-xs"
                  />
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 dark:bg-emerald-950/5">
                  <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Kapha Choice (C)</label>
                  <input
                    type="text"
                    value={qKaphaText}
                    onChange={e => setQKaphaText(e.target.value)}
                    placeholder="Heavy deep sound sleep, wakes sluggish..."
                    className="w-full px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-gray-950 outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {editingQuestionId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestionId(null);
                    setQText('');
                    setQVataText('');
                    setQPittaText('');
                    setQKaphaText('');
                  }}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold font-display"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="cursor-pointer px-5 py-2 rounded-lg bg-ayur-green-500 hover:bg-ayur-green-600 text-white text-xs font-bold font-display shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {editingQuestionId ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </form>

          {/* Listing Table */}
          <div className="rounded-2xl border border-gray-150 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 text-xs font-bold uppercase tracking-wider font-mono">
                  <th className="p-4">ID</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Question</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                {questions.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                    <td className="p-4 font-mono font-bold text-gray-400">{q.id}</td>
                    <td className="p-4"><span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-ayur-green-50 text-ayur-green-600 dark:bg-ayur-green-950/30">{q.category}</span></td>
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200 max-w-[240px] truncate">{q.question}</td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditQuestionClick(q)}
                        className="cursor-pointer p-2 rounded-lg text-ayur-green-600 hover:bg-ayur-green-50 dark:hover:bg-ayur-green-950/20"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setQuestionToDelete(q.id)}
                        className="cursor-pointer p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'recommendations' && (
        <div className="space-y-8">
          {editingRecId ? (
            /* Edit Form */
            <form onSubmit={handleSaveRec} className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-xs space-y-6">
              <h4 className="text-lg font-bold font-display text-gray-900 dark:text-white">Edit Recommendations</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Dietary - Foods to Eat (One per line)</label>
                  <textarea
                    rows={4}
                    value={recEat}
                    onChange={e => setRecEat(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden bg-white dark:bg-gray-950 text-sm font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Dietary - Foods to Avoid (One per line)</label>
                  <textarea
                    rows={4}
                    value={recAvoid}
                    onChange={e => setRecAvoid(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden bg-white dark:bg-gray-950 text-sm font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Exercise Guideline (One per line)</label>
                  <textarea
                    rows={3}
                    value={recExercise}
                    onChange={e => setRecExercise(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden bg-white dark:bg-gray-950 text-sm font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Yoga Asanas (Comma separated)</label>
                  <textarea
                    rows={3}
                    value={recYoga}
                    onChange={e => setRecYoga(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden bg-white dark:bg-gray-950 text-sm font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Meditation Advice</label>
                <input
                  type="text"
                  value={recMeditation}
                  onChange={e => setRecMeditation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden bg-white dark:bg-gray-950 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Sleep Routine advice</label>
                <input
                  type="text"
                  value={recSleep}
                  onChange={e => setRecSleep(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 outline-hidden bg-white dark:bg-gray-950 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecId(null)}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold font-display"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-5 py-2 rounded-lg bg-ayur-green-500 hover:bg-ayur-green-600 text-white text-xs font-bold font-display shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Guidelines
                </button>
              </div>
            </form>
          ) : (
            /* Recommendations Grid List */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map(r => (
                <div key={r.id} className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-ayur-gold-500">Knowledge Set</span>
                    <h5 className="text-xl font-extrabold font-display text-gray-900 dark:text-white">{r.dosha_type} Pacification</h5>
                    <p className="text-xs text-gray-500">Includes {r.diet_eat.length} dietary and {r.yoga.length} yoga recommendations.</p>
                  </div>
                  <button
                    onClick={() => handleEditRecClick(r)}
                    className="cursor-pointer w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800 text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-4 h-4" /> Edit Guidelines
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl shadow-2xl flex items-center gap-3 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 animate-bounce duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' 
              : 'bg-red-50 dark:bg-red-950/20 text-red-500'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-4.5 h-4.5" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5" />
            )}
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{notification.message}</p>
        </div>
      )}

      {/* Custom Sandboxed-Safe Confirmation Modal */}
      {questionToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-150 dark:border-gray-800 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-display text-gray-900 dark:text-white">Delete Question?</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this question? This change is permanent and will modify the live question bank.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold font-display text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = questionToDelete;
                  setQuestionToDelete(null);
                  executeDeleteQuestion(id);
                }}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold font-display text-xs transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
