import { motion } from 'motion/react';
import { Sparkles, Brain, Code, Activity, ShieldAlert, Heart, Sun, Flame, Earth } from 'lucide-react';

interface HomePanelProps {
  onStartAssessment: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export default function HomePanel({ onStartAssessment, isAuthenticated, onOpenAuth }: HomePanelProps) {
  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="text-center py-8 px-4 rounded-3xl bg-linear-to-b from-ayur-green-50 to-white dark:from-ayur-green-700/20 dark:to-transparent glow-green">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ayur-green-100 text-ayur-green-600 dark:bg-ayur-green-600/30 dark:text-ayur-green-100 text-xs font-semibold tracking-wider uppercase font-display">
            <Sparkles className="w-3.5 h-3.5" /> Indian Knowledge Systems (IKS) & AI
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-gray-900 dark:text-white tracking-tight leading-tight">
            Ayurveda Dosha Identification <span className="text-ayur-green-500 dark:text-ayur-gold-500">Expert System</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-sans max-w-2xl mx-auto">
            Discover your mind-body constitution (Prakriti) using a state-of-the-art computational rule engine fused with ancient Vedic healthcare intelligence.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={onStartAssessment}
                className="cursor-pointer px-8 py-4 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 text-white font-semibold font-display shadow-lg hover:shadow-xl hover:shadow-ayur-green-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" /> Begin Free Dosha Assessment
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="cursor-pointer px-8 py-4 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 text-white font-semibold font-display shadow-lg hover:shadow-xl hover:shadow-ayur-green-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" /> Start Assessment (Login Required)
                </button>
                <button
                  onClick={onOpenAuth}
                  className="cursor-pointer px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold font-display shadow-xs transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
                >
                  Create an Account
                </button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Tridosha Theory Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white">The Tridosha Theory</h2>
          <p className="text-gray-600 dark:text-gray-400">
            According to Ayurveda, the universe is made of five elements (Ether, Air, Fire, Water, Earth), which combine in the human body to form three life forces or energy principles called Doshas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Vata Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-800/40 dark:border-gray-700/50 shadow-xs flex flex-col justify-between space-y-4 glow-cyan"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center">
                <Sun className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold font-display text-cyan-600 dark:text-cyan-400">Vata Dosha</h3>
              <p className="text-xs text-gray-500 font-mono">AIR + SPACE (Akasha & Vayu)</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Controls movement, circulation, breathing, and nerve impulses. When balanced, it inspires high creativity, imagination, and agility. Out of balance, it induces anxiety, skin dryness, bloating, and fatigue.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-cyan-600 dark:text-cyan-400 font-semibold uppercase font-mono">
              Key Quality: Mobility & Dryness
            </div>
          </motion.div>

          {/* Pitta Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-800/40 dark:border-gray-700/50 shadow-xs flex flex-col justify-between space-y-4 glow-gold"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold font-display text-orange-600 dark:text-orange-400">Pitta Dosha</h3>
              <p className="text-xs text-gray-500 font-mono">FIRE + WATER (Tejas & Jala)</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Governs metabolic digestion, body temperature, enzymes, and intellect. Balanced Pitta promotes sharp charisma, courage, leadership, and great digestion. Unbalanced Pitta causes anger, inflammation, skin heat, and acidity.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase font-mono">
              Key Quality: Heat & Intensity
            </div>
          </motion.div>

          {/* Kapha Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-800/40 dark:border-gray-700/50 shadow-xs flex flex-col justify-between space-y-4 glow-green"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                <Earth className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">Kapha Dosha</h3>
              <p className="text-xs text-gray-500 font-mono">EARTH + WATER (Prithvi & Jala)</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Forms physical structure, bones, muscles, joints, and fluids. Balanced Kapha builds physical stamina, heavy deep patience, strong immune health, and calm love. Unbalanced Kapha triggers weight gain, congestion, lethargy, and attachment.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase font-mono">
              Key Quality: Stability & Moisture
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ayurvedic Knowledge + Computer Science Section */}
      <section className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 p-1 px-3 rounded-full bg-linear-to-r from-ayur-green-100 to-ayur-gold-50 dark:from-ayur-green-800 dark:to-ayur-gold-800/20 text-ayur-green-600 dark:text-ayur-gold-500 text-xs font-mono">
            <Brain className="w-4 h-4 text-ayur-gold-500" /> SYNERGY OF ANCIENT & MODERN SCIENCE
          </div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Expert Systems in Healthcare</h2>
          <p className="text-gray-600 dark:text-gray-400">
            How this Ayurvedic system connects computational logic with traditional holistic diagnoses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-ayur-green-500" /> Computer Science Architecture
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="font-mono text-ayur-gold-500 font-bold">01.</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Rule-Based Expert System</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The core engine uses classical production rules. It represents traditional expert clinical diagnostics as algorithmic logical statements: <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono text-red-500">IF skin = dry THEN Vata += 2</code>.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="font-mono text-ayur-gold-500 font-bold">02.</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Decision & Classification Trees</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Questions are weighted. They are structured sequentially inside a categorization model to classify users cleanly into single-dominant, dual-dominant, or tri-dosha constitutional profiles.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="font-mono text-ayur-gold-500 font-bold">03.</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Knowledge Base + Inference Engine</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The system acts as a Vaidya's virtual brain. It decouples the clinical knowledge base (questions & suggestions stored in database) from the logical inference engine (server rules processing inputs).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-ayur-gold-500" /> Holistic AI Precision
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              In modern machine learning, features represent individual variables. In Ayurveda, these are symptoms (Lakshanas) and daily behaviors (Dinacharya). 
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              By evaluating 30 comprehensive variables covering physical bone frames, hair thickness, sleep stability, and behavioral stress resilience, the expert engine builds a high-dimensional vector of your physiological state.
            </p>
            <div className="p-4 rounded-lg bg-ayur-green-50/50 dark:bg-ayur-green-950/20 border border-ayur-green-100/30 text-xs text-ayur-green-700 dark:text-ayur-green-300 font-mono">
              Vector: [Vata_Score, Pitta_Score, Kapha_Score] <br />
              Classification Threshold: Dominance = Score_A &gt; (Score_B + 10%)
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20">
          <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Personalized Wellness</h4>
          <p className="text-xs text-gray-500 mt-1">Tailored daily nutrition and yoga routines.</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20">
          <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Rule-Based Precision</h4>
          <p className="text-xs text-gray-500 mt-1">Algorithmic weighting of 30 physical metrics.</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20">
          <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Consultant Option</h4>
          <p className="text-xs text-gray-500 mt-1">Interactive dialogue backed by Gemini.</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20">
          <Code className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Safe & Confidential</h4>
          <p className="text-xs text-gray-500 mt-1">Secure authentication and assessment history.</p>
        </div>
      </section>
    </div>
  );
}
