import React, { useState, useEffect } from 'react';
import { Assessment } from '../types.ts';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Calendar, Trash2, Award, ClipboardCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface HistoryPanelProps {
  token: string;
  onSelectAssessment: (assessment: Assessment) => void;
}

export default function HistoryPanel({ token, onSelectAssessment }: HistoryPanelProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assessments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      
      // Sort assessments by date ascending for the progress chart, but we will display descending for the table!
      setAssessments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this assessment record?')) return;

    try {
      const res = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete record');
      }
      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-ayur-green-500" />
        <p className="text-gray-500 font-display">Retrieving Historical Reports...</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4 max-w-md mx-auto">
        <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto" />
        <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">No Reports Found</h3>
        <p className="text-sm text-gray-500">
          You haven't completed any Dosha assessments yet. Take your first test to unlock your historical tracking reports!
        </p>
      </div>
    );
  }

  // Prep chronological data for tracking line chart
  const chronData = [...assessments]
    .sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime())
    .map(a => {
      const total = a.vata_score + a.pitta_score + a.kapha_score || 1;
      return {
        date: new Date(a.assessment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Vata: Math.round((a.vata_score / total) * 100),
        Pitta: Math.round((a.pitta_score / total) * 100),
        Kapha: Math.round((a.kapha_score / total) * 100)
      };
    });

  // Displays newest reports first
  const displayAssessments = [...assessments].sort(
    (a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime()
  );

  return (
    <div className="space-y-12">
      {/* Historical line tracking chart */}
      {chronData.length > 1 && (
        <div className="p-6 rounded-3xl bg-white border border-gray-150 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white mb-6">Tridoshic Constitutional Tracking</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chronData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Line type="monotone" dataKey="Vata" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Pitta" stroke="#f97316" strokeWidth={3} />
                <Line type="monotone" dataKey="Kapha" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Reports Listing Table */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">All Completed Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayAssessments.map((a) => {
            const tot = a.vata_score + a.pitta_score + a.kapha_score || 1;
            const vP = Math.round((a.vata_score / tot) * 100);
            const pP = Math.round((a.pitta_score / tot) * 100);
            const kP = Math.round((a.kapha_score / tot) * 100);

            return (
              <div
                key={a.id}
                onClick={() => onSelectAssessment(a)}
                className="cursor-pointer p-6 rounded-2xl bg-white hover:bg-gray-50/50 dark:bg-gray-900 dark:hover:bg-gray-850 border border-gray-150 dark:border-gray-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4 glow-green"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-xs font-mono font-bold text-gray-500">
                        {new Date(a.assessment_date).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                      <Award className="w-5 h-5 text-ayur-gold-500 shrink-0" /> {a.dominant_dosha}
                    </h4>
                  </div>
                  
                  {/* Delete Option */}
                  <button
                    onClick={(e) => handleDelete(a.id, e)}
                    className="cursor-pointer p-2 rounded-lg text-gray-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Progress bar breakdowns */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono font-semibold">
                    <span className="text-cyan-600 dark:text-cyan-400">Vata: {vP}%</span>
                    <span className="text-orange-600 dark:text-orange-400">Pitta: {pP}%</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Kapha: {kP}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full flex overflow-hidden">
                    <div style={{ width: `${vP}%` }} className="bg-cyan-500 h-full" />
                    <div style={{ width: `${pP}%` }} className="bg-orange-500 h-full" />
                    <div style={{ width: `${kP}%` }} className="bg-emerald-500 h-full" />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-bold text-ayur-green-600 dark:text-ayur-green-400 uppercase font-display">
                  <span>Detailed Recommendations</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
