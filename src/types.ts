export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  isAdmin: boolean;
}

export interface QuestionOption {
  text: string;
  type: 'vata' | 'pitta' | 'kapha';
  value: number;
}

export interface Question {
  id: number;
  question: string;
  category: string;
  options: QuestionOption[];
}

export interface Assessment {
  id: number;
  user_id: number;
  user_name?: string;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  dominant_dosha: string;
  assessment_date: string;
}

export interface Recommendation {
  id: number;
  dosha_type: 'Vata' | 'Pitta' | 'Kapha';
  diet_eat: string[];
  diet_avoid: string[];
  exercise: string[];
  yoga: string[];
  meditation: string;
  sleep_advice: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAssessments: number;
  doshaDistribution: { name: string; value: number }[];
  averageScores: {
    Vata: number;
    Pitta: number;
    Kapha: number;
  };
}
