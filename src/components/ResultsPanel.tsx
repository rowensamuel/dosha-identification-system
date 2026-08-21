import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Assessment, Recommendation } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Download, Sparkles, Send, Brain, Compass, BookOpen, AlertCircle, RefreshCw, Printer, User, Calendar, ShieldCheck } from 'lucide-react';

interface ResultsPanelProps {
  token: string;
  assessment: Assessment;
  onRetake: () => void;
}

export default function ResultsPanel({ token, assessment, onRetake }: ResultsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorRecs, setErrorRecs] = useState('');

  const total = assessment.vata_score + assessment.pitta_score + assessment.kapha_score || 1;
  const vataPercent = Math.round((assessment.vata_score / total) * 100);
  const pittaPercent = Math.round((assessment.pitta_score / total) * 100);
  const kaphaPercent = Math.round((assessment.kapha_score / total) * 100);

  const chartData = [
    { name: 'Vata (Air & Space)', value: vataPercent, color: '#4b9fb5' },
    { name: 'Pitta (Fire & Water)', value: pittaPercent, color: '#d97706' },
    { name: 'Kapha (Earth & Water)', value: kaphaPercent, color: '#2c5e43' }
  ];

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoadingRecs(true);
        // Fetch recommendations for the major elements
        const doshas: ('Vata' | 'Pitta' | 'Kapha')[] = ['Vata', 'Pitta', 'Kapha'];
        const list: Recommendation[] = [];
        
        for (const dosha of doshas) {
          const res = await fetch(`/api/recommendations/${dosha}`);
          if (res.ok) {
            const data = await res.json();
            list.push(data);
          }
        }
        setRecommendations(list);
      } catch (err: any) {
        setErrorRecs(err.message);
      } finally {
        setLoadingRecs(false);
      }
    }
    fetchRecommendations();
  }, [assessment]);

  // Initial greeting from AI Consultant
  useEffect(() => {
    setAiChat([
      {
        role: 'model',
        text: `Namaste! I am your AI Ayurvedic Vaidya (Vedic Consultant). I have thoroughly studied your diagnostic profile. 

Your dominant constitution is ${assessment.dominant_dosha}.
• Vata: ${vataPercent}% (Air & Ether elements)
• Pitta: ${pittaPercent}% (Fire & Water elements)
• Kapha: ${kaphaPercent}% (Earth & Water elements)

What would you like to know about your Prakriti, foods to pacify your symptoms, or balancing your daily cycle? Ask me anything!`
      }
    ]);
  }, [assessment]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || loadingAi) return;

    const userMessage = aiPrompt.trim();
    setAiPrompt('');
    setAiChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoadingAi(true);

    try {
      // Re-map chat for Gemini format
      const history = aiChat.map(c => ({
        role: c.role,
        parts: [{ text: c.text }]
      }));

      const contextPrompt = `
User Profile:
- Dominant Dosha: ${assessment.dominant_dosha}
- Scores: Vata: ${vataPercent}%, Pitta: ${pittaPercent}%, Kapha: ${kaphaPercent}%
User Query: ${userMessage}

Respond as the virtual Ayurvedic doctor based on their constitution scores above.
`;

      const res = await fetch('/api/gemini/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: contextPrompt,
          chatHistory: history
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Consultation failed');

      setAiChat(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      setAiChat(prev => [...prev, { role: 'model', text: `My apologies. I encountered a disconnect: ${err.message}. Please try again.` }]);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!assessment) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 25;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin - 5) {
        doc.addPage();
        drawPageDecorations();
        y = margin + 10;
      }
    };

    const drawPageDecorations = () => {
      // Golden corner frames or borders
      doc.setDrawColor(217, 119, 6); // #d97706 (Ayur gold)
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Delicate header accent
      doc.setDrawColor(44, 94, 67); // #2c5e43 (Ayur green)
      doc.setLineWidth(1.5);
      doc.line(12, 12, pageWidth - 12, 12);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('VedaLife Ayurveda Assessment - Wellness Report', margin, pageHeight - 13);
      doc.text('Confidential Wellness Profile', pageWidth - margin - 40, pageHeight - 13);
    };

    // Draw first page frame
    drawPageDecorations();

    // 1. HEADER BRANDING
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(44, 94, 67); // #2c5e43 (Deep Ayur Green)
    doc.text('VEDALIFE CLINICAL PROFILE', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Personalized Vedic Prakriti Diagnostic Guideline', margin, y);
    y += 4;

    // Line separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // 2. USER PROFILE DETAILS TABLE
    doc.setFillColor(245, 248, 246); // Subtle light green background
    doc.rect(margin, y, contentWidth, 24, 'F');
    doc.setDrawColor(210, 225, 215);
    doc.rect(margin, y, contentWidth, 24, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    const dateStr = new Date(assessment.assessment_date).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    doc.text('CONSTITUTION TYPE:', margin + 6, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // Gold
    doc.setFontSize(11);
    doc.text(`${assessment.dominant_dosha.toUpperCase()}`, margin + 48, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('ASSESSMENT DATE:', margin + 6, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(dateStr, margin + 48, y + 16);

    const userName = assessment.user_name || localStorage.getItem('ayur_user_name') || 'Ayurvedic Seeker';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('SEEKER NAME:', margin + contentWidth / 2 + 10, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(userName, margin + contentWidth / 2 + 42, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('IMMUNITY POTENCY:', margin + contentWidth / 2 + 10, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('High alignment / Balanced', margin + contentWidth / 2 + 42, y + 16);

    y += 34;

    // 3. TRIDOSHA DISTRIBUTION ANALYSIS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 94, 67); // Deep Green
    doc.text('I. Tridoshic Profile Breakdown', margin, y);
    y += 8;

    const doshasData = [
      { name: 'VATA (Air & Ether / Space)', value: vataPercent, color: [75, 159, 181], desc: 'Controls movement, nervous system, breath' },
      { name: 'PITTA (Fire & Water / Agni)', value: pittaPercent, color: [217, 119, 6], desc: 'Controls metabolism, digestion, intelligence' },
      { name: 'KAPHA (Earth & Water / Soma)', value: kaphaPercent, color: [44, 94, 67], desc: 'Controls structure, lubrication, physical fluid stability' }
    ];

    doshasData.forEach((d) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(d.name, margin, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(d.color[0], d.color[1], d.color[2]);
      doc.text(`${d.value}%`, pageWidth - margin - 15, y);
      y += 4;

      // Draw gauge track
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentWidth, 4, 'F');
      
      // Draw gauge filled
      doc.setFillColor(d.color[0], d.color[1], d.color[2]);
      const fillW = (d.value / 100) * contentWidth;
      doc.rect(margin, y, fillW, 4, 'F');
      y += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text(d.desc, margin, y);
      y += 8;
    });

    y += 4;

    // 4. BRIEF EXPLANATIVE TEXT
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 94, 67);
    doc.text('Understanding Your Balance:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 70);
    const explText = `In Ayurvedic physiology, everyone shares all three energy matrices (Vata, Pitta, and Kapha). However, your dominant constitution is ${assessment.dominant_dosha}. This is your genetic imprint (Prakriti). Wellness is sustained by avoiding the excess accumulation of your dominant elements, maintaining harmony with the seasonal flow and dietary guidelines.`;
    const splitExpl = doc.splitTextToSize(explText, contentWidth);
    doc.text(splitExpl, margin, y);
    y += (splitExpl.length * 4.5) + 10;

    // 5. PERSONALIZED WELLNESS GUIDELINE
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 94, 67);
    doc.text('II. Ayurvedic Nutrition (Ahara)', margin, y);
    y += 8;

    if (primaryRec) {
      // Draw Diet Foods to Eat
      checkPageBreak(40);
      doc.setFillColor(240, 248, 242); // Soft emerald green
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(44, 94, 67);
      doc.text('FOODS TO EMBRACE & PACIFY SYMPTOMS', margin + 3, y + 4.5);
      y += 9;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      primaryRec.diet_eat.forEach((food) => {
        checkPageBreak(6);
        doc.setFillColor(44, 94, 67);
        doc.circle(margin + 4, y + 1.2, 0.8, 'F'); // Draw bullet list circle
        
        const textLines = doc.splitTextToSize(food, contentWidth - 12);
        doc.text(textLines, margin + 8, y + 2.5);
        y += (textLines.length * 4.5) + 1;
      });

      y += 4;

      // Draw Diet Foods to Avoid
      checkPageBreak(40);
      doc.setFillColor(254, 242, 242); // Soft red
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(185, 28, 28);
      doc.text('FOODS TO DECREASE OR CAUTIOUSLY AVOID', margin + 3, y + 4.5);
      y += 9;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);

      primaryRec.diet_avoid.forEach((food) => {
        checkPageBreak(6);
        doc.setFillColor(185, 28, 28);
        doc.circle(margin + 4, y + 1.2, 0.8, 'F');
        
        const textLines = doc.splitTextToSize(food, contentWidth - 12);
        doc.text(textLines, margin + 8, y + 2.5);
        y += (textLines.length * 4.5) + 1;
      });

      y += 8;

      // Lifestyle Section
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(44, 94, 67);
      doc.text('III. Daily Routine & Lifestyle (Vihara)', margin, y);
      y += 8;

      const lifestyleHabits = [
        { label: 'Physical Activity', text: primaryRec.exercise.join(' ') },
        { label: 'Yoga Poses & Asanas', text: `Recommended poses: ${primaryRec.yoga.join(', ')}` },
        { label: 'Meditation & Breathwork', text: primaryRec.meditation },
        { label: 'Sleep & Night Routine', text: primaryRec.sleep_advice }
      ];

      lifestyleHabits.forEach((habit) => {
        checkPageBreak(25);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(217, 119, 6); // Warm gold
        doc.text(habit.label, margin, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        const splitText = doc.splitTextToSize(habit.text, contentWidth);
        doc.text(splitText, margin, y);
        y += (splitText.length * 4.5) + 6;
      });
    }

    // 6. CLINICAL DISCLAIMER
    checkPageBreak(30);
    y += 4;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('IMPORTANT CLINICAL DISCLAIMER:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    const disclaimer = 'The information compiled in this Prakriti constitution profile is drawn from traditional Ayurvedic principles. This documentation is for educational, lifestyle optimization, and self-awareness purposes. It is NOT intended to prescribe, cure, diagnose, or treat any medical conditions or substitute professional medical advice, services, or protocols.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(splitDisclaimer, margin, y);

    // Save PDF
    doc.save(`ayur_prakriti_report_${assessment.dominant_dosha.toLowerCase()}.pdf`);
  };

  // Find dominant dosha recommendation objects
  const getPrimaryRecommendations = () => {
    const primary = assessment.dominant_dosha.split('-')[0]; // Handle dual "Vata-Pitta"
    const found = recommendations.find(r => r.dosha_type === primary);
    if (found) return found;

    // Fallback if no exact match (e.g. Tridoshic): find the highest score among the three
    if (recommendations.length > 0) {
      const scores = [
        { name: 'Vata', score: assessment.vata_score },
        { name: 'Pitta', score: assessment.pitta_score },
        { name: 'Kapha', score: assessment.kapha_score }
      ].sort((a, b) => b.score - a.score);
      return recommendations.find(r => r.dosha_type === scores[0].name) || recommendations[0];
    }
    return undefined;
  };

  const primaryRec = getPrimaryRecommendations();

  return (
    <div className="space-y-12">
      {/* Action panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Assessment Computed</h2>
          <p className="text-xs text-gray-500">Report generated on {new Date(assessment.assessment_date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold font-display flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={onRetake}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 text-white text-sm font-semibold font-display shadow-sm flex items-center gap-2 transition-all"
          >
            <Compass className="w-4 h-4" /> Retake Test
          </button>
        </div>
      </div>

      {/* Main Print Area */}
      <div id="printable-area" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dominant Dosha Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-8 rounded-3xl bg-linear-to-b from-ayur-green-50 to-white dark:from-ayur-green-950/20 dark:to-transparent border border-gray-100 dark:border-gray-800 text-center space-y-6 shadow-lg glow-green relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-ayur-gold-500/10 text-ayur-gold-600 rounded-bl-3xl font-mono text-xs font-bold uppercase tracking-wider">
              Dominant Constitution
            </div>

            <div className="space-y-2 pt-4">
              <span className="text-xs font-bold text-ayur-green-600 dark:text-ayur-green-400 uppercase tracking-widest font-mono">My Prakriti</span>
              <h3 className="text-4xl font-extrabold font-display text-gray-900 dark:text-white leading-none">
                {assessment.dominant_dosha}
              </h3>
            </div>

            {/* Wellness Meter */}
            <div className="space-y-2 max-w-[200px] mx-auto">
              <div className="text-xs font-bold text-gray-500 uppercase font-mono">Dosha Alignment Meter</div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div
                    style={{ width: `${Math.max(vataPercent, pittaPercent, kaphaPercent)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-ayur-green-500 to-ayur-gold-500 rounded-full"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                {Math.max(vataPercent, pittaPercent, kaphaPercent)}% Dominance Intensity
              </p>
            </div>

            <p className="text-sm text-gray-650 dark:text-gray-300 leading-relaxed font-sans">
              Your expert assessment scores indicate a dominant <span className="font-semibold text-ayur-green-600 dark:text-ayur-green-400">{assessment.dominant_dosha}</span> constitution. In Ayurveda, this signifies your unique mental-physical imprint. Balancing this dominant dynamic maintains full disease immunity and longevity.
            </p>

            {/* Scores summary list */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-display font-semibold text-gray-700 dark:text-gray-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" /> Vata Score
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{vataPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-display font-semibold text-gray-700 dark:text-gray-300">
                  <span className="w-3 h-3 rounded-full bg-orange-500" /> Pitta Score
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{pittaPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-display font-semibold text-gray-700 dark:text-gray-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Kapha Score
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{kaphaPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-md">
            <h4 className="text-lg font-bold font-display text-gray-900 dark:text-white mb-6">Tridoshic Profile Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Recharts Pie */}
              <div className="h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Recharts Bar */}
              <div className="h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Recommendations Engine Section */}
      <div className="p-8 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6 text-ayur-green-500" />
          <div>
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Personalized Wellness Guideline</h3>
            <p className="text-sm text-gray-500">Custom diet and lifestyle recommendations compiled by the Rule Engine</p>
          </div>
        </div>

        {loadingRecs ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-ayur-green-500" />
            <p className="text-gray-500">Compiling traditional recommendations...</p>
          </div>
        ) : errorRecs || !primaryRec ? (
          <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Recommended guidelines could not be retrieved. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Diet Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold font-display text-ayur-green-600 dark:text-ayur-green-400 pb-2 border-b border-gray-100 dark:border-gray-800">
                Ayurvedic Nutrition (Ahara)
              </h4>
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-500/10 space-y-2">
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Foods to Pacify & Eat
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-650 dark:text-gray-300 space-y-1">
                    {primaryRec.diet_eat.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-red-50/40 dark:bg-red-950/10 border border-red-500/10 space-y-2">
                  <h5 className="font-semibold text-red-800 dark:text-red-400 text-sm flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-500" /> Foods to Avoid/Reduce
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-650 dark:text-gray-300 space-y-1">
                    {primaryRec.diet_avoid.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lifestyle Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold font-display text-ayur-gold-600 dark:text-ayur-gold-500 pb-2 border-b border-gray-100 dark:border-gray-800">
                Lifestyle & Routines (Vihara)
              </h4>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-850 space-y-1.5">
                  <h5 className="font-semibold text-gray-800 dark:text-white text-sm">Physical Activity</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {primaryRec.exercise.join(' ')}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-850 space-y-1.5">
                  <h5 className="font-semibold text-gray-800 dark:text-white text-sm">Yoga Asanas</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recommended poses: {primaryRec.yoga.join(', ')}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-850 space-y-1.5">
                  <h5 className="font-semibold text-gray-800 dark:text-white text-sm">Meditation & Breathing</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {primaryRec.meditation}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-850 space-y-1.5">
                  <h5 className="font-semibold text-gray-800 dark:text-white text-sm">Sleep Routine</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {primaryRec.sleep_advice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Ayurvedic Consultant Chat Widget */}
      <div className="p-6 rounded-3xl bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-ayur-green-500 text-white flex items-center justify-center glow-green">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold font-display text-gray-900 dark:text-white flex items-center gap-1.5">
              Interactive AI Ayurvedic Consultant <span className="inline-flex py-0.5 px-2 rounded-full bg-linear-to-r from-ayur-green-100 to-ayur-gold-50 dark:from-ayur-green-800 dark:to-ayur-gold-800/10 text-ayur-green-600 dark:text-ayur-gold-500 text-[10px] font-mono">GEMINI-3.5</span>
            </h4>
            <p className="text-xs text-gray-500">Ask customized clinical questions about your dominant {assessment.dominant_dosha} traits</p>
          </div>
        </div>

        {/* Chat Log */}
        <div className="h-[300px] overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 p-4 space-y-4 no-scrollbar mb-4">
          {aiChat.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ayur-green-500 text-white rounded-br-xs font-medium'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-xs'
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loadingAi && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-bl-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-ayur-green-500" />
                <span className="text-xs text-gray-500">AI Vaidya is analyzing classic formulations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={loadingAi}
            placeholder={`Ask about your ${assessment.dominant_dosha} Prakriti (e.g. "What spices should I cook with in winter?")`}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 dark:text-white text-sm outline-hidden focus:border-ayur-green-500"
          />
          <button
            type="submit"
            disabled={loadingAi || !aiPrompt.trim()}
            className="cursor-pointer px-5 py-3 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 disabled:bg-gray-200 text-white flex items-center justify-center transition-all"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

      {/* Print Specific Inline Styling to keep the report highly polished when saved */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide non-printable panels */
          nav, button, form, footer, .cursor-pointer, .no-print {
            display: none !important;
          }
          #printable-area {
            display: block !important;
          }
          .glass-panel, .glow-green, .glow-gold {
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
