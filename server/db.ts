import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  age: number;
  gender: string;
  isAdmin: boolean;
}

export interface QuestionOption {
  text: string;
  type: 'vata' | 'pitta' | 'kapha';
  value: number; // score added if selected
}

export interface Question {
  id: number;
  question: string;
  category: string; // e.g., 'Physical Traits', 'Physiological', 'Psychological'
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

export interface DatabaseSchema {
  users: User[];
  questions: Question[];
  assessments: Assessment[];
  recommendations: Recommendation[];
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    questions: [],
    assessments: [],
    recommendations: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse database file, starting fresh:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write to database file:', err);
    }
  }

  private seedInitialData() {
    // 1. Seed Admin User
    const adminPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
    this.data.users = [
      {
        id: 1,
        name: 'Ayurveda Admin',
        email: 'admin@ayurveda.org',
        passwordHash: adminPasswordHash,
        age: 35,
        gender: 'Other',
        isAdmin: true,
      }
    ];

    // 2. Seed 30 Ayurveda Questions
    this.data.questions = [
      // CATEGORY 1: PHYSICAL CHARACTERISTICS
      {
        id: 1,
        question: "How would you describe your general body frame?",
        category: "Physical Characteristics",
        options: [
          { text: "Lean, thin, tall or short, prominent joints and bony structure", type: "vata", value: 2 },
          { text: "Medium built, compact, well-developed musculature, stable weight", type: "pitta", value: 2 },
          { text: "Large, stocky, broad frame, tends to gain weight easily", type: "kapha", value: 2 }
        ]
      },
      {
        id: 2,
        question: "Describe your skin's natural texture and appearance:",
        category: "Physical Characteristics",
        options: [
          { text: "Dry, rough, cool to touch, thin, prone to cracking or ashiness", type: "vata", value: 2 },
          { text: "Warm, soft, reddish/pinkish, sensitive, prone to acne or freckles", type: "pitta", value: 2 },
          { text: "Thick, soft, smooth, oily, pale or fair, slow to wrinkle", type: "kapha", value: 2 }
        ]
      },
      {
        id: 3,
        question: "What is the nature of your hair?",
        category: "Physical Characteristics",
        options: [
          { text: "Dry, frizzy, brittle, coarse, dark, curly/wavy", type: "vata", value: 2 },
          { text: "Fine, soft, straight, blond/red/light brown, prone to early graying or thinning", type: "pitta", value: 2 },
          { text: "Thick, abundant, oily, wavy, lustrous, dark or glowing", type: "kapha", value: 2 }
        ]
      },
      {
        id: 4,
        question: "Describe the appearance and size of your eyes:",
        category: "Physical Characteristics",
        options: [
          { text: "Small, dry, blinking frequently, dark or grayish, slightly sunken", type: "vata", value: 2 },
          { text: "Medium-sized, sharp, bright, reddish corner, sensitive to bright light", type: "pitta", value: 2 },
          { text: "Large, wide, attractive, thick lashes, calm, white is clear white", type: "kapha", value: 2 }
        ]
      },
      {
        id: 5,
        question: "How is your fingernail appearance?",
        category: "Physical Characteristics",
        options: [
          { text: "Dry, rough, brittle, uneven, small, easily broken", type: "vata", value: 2 },
          { text: "Soft, pink, pliable, warm, moderately sized", type: "pitta", value: 2 },
          { text: "Thick, strong, smooth, shiny, large and white", type: "kapha", value: 2 }
        ]
      },
      {
        id: 6,
        question: "How would you describe your teeth and gums?",
        category: "Physical Characteristics",
        options: [
          { text: "Uneven, crooked, protruding, dry gums, easily chipped", type: "vata", value: 2 },
          { text: "Medium-sized, yellowish tint, soft gums, prone to bleeding", type: "pitta", value: 2 },
          { text: "Large, white, strong, well-aligned, healthy thick gums", type: "kapha", value: 2 }
        ]
      },
      {
        id: 7,
        question: "Describe your walk and overall body movements:",
        category: "Physical Characteristics",
        options: [
          { text: "Fast, light, agile, unstable, often fidgeting", type: "vata", value: 2 },
          { text: "Determined, medium-paced, sharp, purposeful, steady", type: "pitta", value: 2 },
          { text: "Slow, heavy, graceful, majestic, calm and deliberate", type: "kapha", value: 2 }
        ]
      },
      {
        id: 8,
        question: "How is your perspiration/sweating level?",
        category: "Physical Characteristics",
        options: [
          { text: "Scanty, minimal, dry body odor, rarely sweats unless intense exercise", type: "vata", value: 2 },
          { text: "Profuse, warm, strong odor, sweats easily in moderate heat", type: "pitta", value: 2 },
          { text: "Moderate but steady, pleasant or mild odor, starts slowly", type: "kapha", value: 2 }
        ]
      },
      {
        id: 9,
        question: "How is your voice and speaking rate?",
        category: "Physical Characteristics",
        options: [
          { text: "Rapid, high-pitched, sometimes weak, cracked, or talkative", type: "vata", value: 2 },
          { text: "Sharp, clear, commanding, moderate-paced, persuasive", type: "pitta", value: 2 },
          { text: "Slow, melodious, deep, resonant, sweet-toned", type: "kapha", value: 2 }
        ]
      },
      {
        id: 10,
        question: "Describe your joints' structure:",
        category: "Physical Characteristics",
        options: [
          { text: "Prominent, cracking, popping, dry, loose", type: "vata", value: 2 },
          { text: "Medium, flexible, warm, healthy, occasionally inflamed", type: "pitta", value: 2 },
          { text: "Well-padded, hidden, lubricated, large, very stable", type: "kapha", value: 2 }
        ]
      },

      // CATEGORY 2: PHYSIOLOGICAL TRAITS
      {
        id: 11,
        question: "How is your typical appetite?",
        category: "Physiological Traits",
        options: [
          { text: "Variable, irregular, sometimes hungry, sometimes forgetting to eat", type: "vata", value: 2 },
          { text: "Strong, intense, can't tolerate delayed meals, sharp hunger", type: "pitta", value: 2 },
          { text: "Low but steady, can easily skip meals without discomfort", type: "kapha", value: 2 }
        ]
      },
      {
        id: 12,
        question: "How would you describe your digestion and bowel habits?",
        category: "Physiological Traits",
        options: [
          { text: "Prone to gas, bloating, constipation, dry or hard stools", type: "vata", value: 2 },
          { text: "Fast, loose stools, hot sensation, occasionally burning, frequent", type: "pitta", value: 2 },
          { text: "Slow, heavy, sluggish, sticky or large stools, highly regular", type: "kapha", value: 2 }
        ]
      },
      {
        id: 13,
        question: "What are your sleeping habits?",
        category: "Physiological Traits",
        options: [
          { text: "Light, interrupted, takes time to fall asleep, wakes up tired", type: "vata", value: 2 },
          { text: "Moderate, 6-7 hours, sound, wakes up hot but alert", type: "pitta", value: 2 },
          { text: "Deep, long (8+ hours), heavy, hates waking up, very sound sleep", type: "kapha", value: 2 }
        ]
      },
      {
        id: 14,
        question: "What is your preference in weather and temperature?",
        category: "Physiological Traits",
        options: [
          { text: "Hates cold, wind, and dry weather; loves warmth, sun, and steam", type: "vata", value: 2 },
          { text: "Hates extreme heat, bright sun, and humidity; loves cool, breezy weather", type: "pitta", value: 2 },
          { text: "Hates damp, cold, and cloudy days; loves warm, dry, windy weather", type: "kapha", value: 2 }
        ]
      },
      {
        id: 15,
        question: "How is your general physical energy and endurance?",
        category: "Physiological Traits",
        options: [
          { text: "Bursts of energy, tires quickly, hyperactive but low stamina", type: "vata", value: 2 },
          { text: "Moderate energy, focused, highly determined, good with goal-setting", type: "pitta", value: 2 },
          { text: "High stamina, slow starter, great long-term endurance, steady energy", type: "kapha", value: 2 }
        ]
      },
      {
        id: 16,
        question: "How is your taste preference? What foods do you crave?",
        category: "Physiological Traits",
        options: [
          { text: "Crave sweet, sour, salty, and warm/oily foods", type: "vata", value: 2 },
          { text: "Crave sweet, bitter, astringent, and cold foods/drinks", type: "pitta", value: 2 },
          { text: "Crave pungent, bitter, astringent, and light/warm spicy foods", type: "kapha", value: 2 }
        ]
      },
      {
        id: 17,
        question: "Describe your liquid/water intake habits:",
        category: "Physiological Traits",
        options: [
          { text: "Thirst is unpredictable, drinks in small sips, prefers warm drinks", type: "vata", value: 2 },
          { text: "Always thirsty, drinks large volumes, craves ice-cold water", type: "pitta", value: 2 },
          { text: "Rarely feels thirsty, drinks little, can go hours without drinking", type: "kapha", value: 2 }
        ]
      },
      {
        id: 18,
        question: "How does your body react to physical exercise?",
        category: "Physiological Traits",
        options: [
          { text: "Exhausted easily, gets dehydrated, joints ache, heart rate shoots up fast", type: "vata", value: 2 },
          { text: "Heats up fast, sweats intensely, gets competitive, pushed to limits", type: "pitta", value: 2 },
          { text: "Feels refreshed, enjoys slow steady exertion, can keep going for long hours", type: "kapha", value: 2 }
        ]
      },
      {
        id: 19,
        question: "How is your pulse beat quality (if known, or general pulse rate)?",
        category: "Physiological Traits",
        options: [
          { text: "Fast, feeble, irregular, slithers like a snake (80-100 bpm)", type: "vata", value: 2 },
          { text: "Moderate, hot, jumping like a frog (70-80 bpm)", type: "pitta", value: 2 },
          { text: "Slow, steady, gliding like a swan (60-70 bpm)", type: "kapha", value: 2 }
        ]
      },
      {
        id: 20,
        question: "Describe your immune system and recovery rate:",
        category: "Physiological Traits",
        options: [
          { text: "Fragile, catches colds/infections easily, slow irregular recovery", type: "vata", value: 2 },
          { text: "Moderate, prone to fever, skin rashes, fast and clean recovery", type: "pitta", value: 2 },
          { text: "Strong, robust, rarely falls sick, takes time to get sick but steady healing", type: "kapha", value: 2 }
        ]
      },

      // CATEGORY 3: PSYCHOLOGICAL & BEHAVIORAL TRAITS
      {
        id: 21,
        question: "How is your memory power and learning style?",
        category: "Psychological Traits",
        options: [
          { text: "Learns very quickly, but forgets just as quickly (short-term focus)", type: "vata", value: 2 },
          { text: "Learns moderately fast, highly logical, remembers with visual memory", type: "pitta", value: 2 },
          { text: "Learns slowly, requires repetitions, but never forgets (long-term memory)", type: "kapha", value: 2 }
        ]
      },
      {
        id: 22,
        question: "How do you react to stressful situations?",
        category: "Psychological Traits",
        options: [
          { text: "Anxiety, worry, fear, nervous, overthinking, sleeps poorly", type: "vata", value: 2 },
          { text: "Anger, irritability, impatience, frustration, aggressive actions", type: "pitta", value: 2 },
          { text: "Calm, withdrawing, slow to react, stubborness, emotional eating", type: "kapha", value: 2 }
        ]
      },
      {
        id: 23,
        question: "How would you describe your general temperament and personality?",
        category: "Psychological Traits",
        options: [
          { text: "Enthusiastic, creative, energetic, changeable, spontaneous", type: "vata", value: 2 },
          { text: "Intellectual, organized, sharp, focused, competitive, leader", type: "pitta", value: 2 },
          { text: "Calm, peaceful, loyal, forgiving, stable, slow, loving", type: "kapha", value: 2 }
        ]
      },
      {
        id: 24,
        question: "How is your money spending habit?",
        category: "Psychological Traits",
        options: [
          { text: "Spends impulsively, buys on a whim, struggles to save, keeps loose budget", type: "vata", value: 2 },
          { text: "Spends methodically on high-quality luxury, tech, or investments; plans carefully", type: "pitta", value: 2 },
          { text: "Saves money easily, hates spending unnecessarily, accumulates wealth", type: "kapha", value: 2 }
        ]
      },
      {
        id: 25,
        question: "How are your dreams when you sleep?",
        category: "Psychological Traits",
        options: [
          { text: "Active, fearful, flying, running, falling, windy, chaotic", type: "vata", value: 2 },
          { text: "Fiery, intense, problem-solving, fighting, colorful, heroic", type: "pitta", value: 2 },
          { text: "Watery, peaceful, lakes, gardens, romance, slow-moving", type: "kapha", value: 2 }
        ]
      },
      {
        id: 26,
        question: "How do you make decisions?",
        category: "Psychological Traits",
        options: [
          { text: "Hesitant, doubts easily, frequently changes mind based on emotion", type: "vata", value: 2 },
          { text: "Quick, decisive, relies on logic, factual, rarely looks back", type: "pitta", value: 2 },
          { text: "Slow, deliberate, takes days to decide, stands firm once decided", type: "kapha", value: 2 }
        ]
      },
      {
        id: 27,
        question: "How is your social interaction style?",
        category: "Psychological Traits",
        options: [
          { text: "Very talkative, makes friends quickly but shallow bonds, expressive", type: "vata", value: 2 },
          { text: "Selectively social, loves debates and deep discussions, direct speaker", type: "pitta", value: 2 },
          { text: "Quiet, extremely loyal, maintains long-lasting deep friendships", type: "kapha", value: 2 }
        ]
      },
      {
        id: 28,
        question: "What is your main spiritual or mental state during leisure?",
        category: "Psychological Traits",
        options: [
          { text: "Restless, looking for stimulation, browsing, walking around", type: "vata", value: 2 },
          { text: "Planning next week, reading educational or productive books, organizing", type: "pitta", value: 2 },
          { text: "Relaxing deeply, listening to music, sleeping, sitting comfortably", type: "kapha", value: 2 }
        ]
      },
      {
        id: 29,
        question: "How is your typical response to criticism?",
        category: "Psychological Traits",
        options: [
          { text: "Takes it personally, feels hurt/defensive, doubts self-worth instantly", type: "vata", value: 2 },
          { text: "Rebuts with counter-arguments, gets angry or tries to prove them wrong", type: "pitta", value: 2 },
          { text: "Remains unmoved, ignores it, takes a long time to reflect or cares little", type: "kapha", value: 2 }
        ]
      },
      {
        id: 30,
        question: "Which of these best describes your daily energy pattern?",
        category: "Psychological Traits",
        options: [
          { text: "Unstable, gets super creative in evenings but crashes by late night", type: "vata", value: 2 },
          { text: "Intense daytime focus, burns bright all day, needs clean cutoffs", type: "pitta", value: 2 },
          { text: "Slow morning start, peak energy in afternoon, very steady all day", type: "kapha", value: 2 }
        ]
      }
    ];

    // 3. Seed Ayurveda Recommendations
    this.data.recommendations = [
      {
        id: 1,
        dosha_type: "Vata",
        diet_eat: [
          "Warm, thoroughly cooked, and oily foods.",
          "Sweet, sour, and salty tastes.",
          "Healthy fats like Ghee, sesame oil, and olive oil.",
          "Grains like white rice, wheat, and oats.",
          "Cooked root vegetables (carrots, sweet potatoes, beets).",
          "Spices like ginger, cumin, cardamom, cinnamon, and garlic."
        ],
        diet_avoid: [
          "Raw, dry, cold, or light foods.",
          "Bitter, pungent, and astringent tastes.",
          "Raw salads, cold beverages, iced drinks, and frozen food.",
          "Dry snacks like popcorn, crackers, and chips.",
          "Caffeine, carbonated drinks, and white sugar.",
          "Beans (except mung beans) as they produce gas."
        ],
        exercise: [
          "Gentle, grounding activities to preserve energy.",
          "Walking, slow hiking, and swimming.",
          "Light jogging, but avoiding extreme cardiovascular exhaustion."
        ],
        yoga: [
          "Slow Hatha Yoga, focusing on gentle holding.",
          "Tadasana (Mountain Pose), Virabhadrasana (Warrior), Balasana (Child's Pose).",
          "Gentle spinal twists and forward folds."
        ],
        meditation: "Grounding meditation focusing on the breath or body awareness. Visualizing a peaceful, warm landscape. Practice 10-15 minutes of Yoga Nidra.",
        sleep_advice: "Go to bed early by 10:00 PM. Sleep for 8-9 hours in a cozy, warm, and dark room. Establish a soothing night routine (warm milk, oiling feet)."
      },
      {
        id: 2,
        dosha_type: "Pitta",
        diet_eat: [
          "Cool or warm (not steaming hot) foods.",
          "Sweet, bitter, and astringent tastes.",
          "Cooling fats like Ghee, coconut oil, and sunflower oil.",
          "Refreshing grains like basmati rice, barley, and oats.",
          "Cooling vegetables (cucumber, zucchini, broccoli, sweet potatoes).",
          "Fresh fruits like sweet grapes, melons, pears, and coconuts.",
          "Mild cooling spices like fennel, coriander, mint, turmeric, and cardamom."
        ],
        diet_avoid: [
          "Hot, spicy, salty, or highly acidic foods.",
          "Pungent, sour, and salty tastes.",
          "Chili peppers, cayenne, garlic, onions, and excessive ginger.",
          "Sour fruits like lemons, grapefruits, tomatoes, and vinegar.",
          "Deep-fried foods, fermented foods, alcohol, and caffeine.",
          "Red meat and aged cheeses."
        ],
        exercise: [
          "Moderately challenging exercises performed during cooler hours (morning/evening).",
          "Swimming in cool water, nature walks, cycling.",
          "Non-competitive team sports to avoid irritation."
        ],
        yoga: [
          "Cooling, relaxing yoga sequences with moderate effort.",
          "Chandra Namaskar (Moon Salutation), Bhujangasana (Cobra), Matsyasana (Fish Pose).",
          "Pranayama: Sheetali (Cooling breath) or Nadi Shodhana."
        ],
        meditation: "Compassion-focused meditation (Metta) or mindfulness. Focus on letting go of control, judgment, and competition. Practice 15-20 minutes daily.",
        sleep_advice: "Go to bed by 10:30 PM, before the Pitta midnight heat peaks. Sleep with light, breathable cotton blankets. Avoid screens at least 1 hour before sleep."
      },
      {
        id: 3,
        dosha_type: "Kapha",
        diet_eat: [
          "Warm, light, dry, and spicy foods.",
          "Pungent, bitter, and astringent tastes.",
          "Minimal oils: dry roasting or steam cooking is best; mustard or corn oil in tiny amounts.",
          "Lighter grains like quinoa, millet, buckwheat, and barley.",
          "Pungent/bitter leafy greens, cabbage, cauliflower, garlic, and onions.",
          "Astrigent fruits like apples, pears, and berries.",
          "Warm stimulant spices like ginger, black pepper, chili, cinnamon, and cumin."
        ],
        diet_avoid: [
          "Cold, heavy, oily, and sweet foods.",
          "Sweet, sour, and salty tastes.",
          "Heavy dairy products (cheese, thick milk, butter, ice cream).",
          "Deep-fried items, fatty meats, and white flour.",
          "Sweet, juicy fruits like bananas, avocados, mangoes, and dates.",
          "Excessive salt, white sugar, and ice-cold drinks."
        ],
        exercise: [
          "Intense, vigorous, and highly stimulating exercises to counter sluggishness.",
          "Power walking, fast running, heavy cardio, cycling.",
          "High-Intensity Interval Training (HIIT) and competitive activities."
        ],
        yoga: [
          "Active, dynamic, and heat-generating yoga sequences.",
          "Surya Namaskar (Sun Salutations) at a fast pace.",
          "Virabhadrasana (Warrior), Dhanurasana (Bow Pose), Adho Mukha Svanasana (Downward Dog).",
          "Pranayama: Kapalabhati (Skull-shining breath) or Bhastrika."
        ],
        meditation: "Active or walking meditation. Visualizing vibrant, energizing colors. Chanting mantras to activate cellular energy. Restrict sleeping in the daytime.",
        sleep_advice: "Wake up early by 6:00 AM. Avoid sleeping more than 7 hours. Do not take daytime naps, as it increases sluggishness and Kapha congestion."
      }
    ];

    this.save();
  }

  // --- Users Table CRUD ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: number): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id'>): User {
    const nextId = this.data.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const newUser: User = { ...user, id: nextId };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: number, updates: Partial<Omit<User, 'id' | 'passwordHash'>>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    return this.data.users[index];
  }

  public updatePassword(id: number, newPasswordHash: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.save();
    return true;
  }

  // --- Questions Table CRUD ---
  public getQuestions(): Question[] {
    return this.data.questions;
  }

  public getQuestionById(id: number): Question | undefined {
    return this.data.questions.find(q => q.id === id);
  }

  public createQuestion(question: Omit<Question, 'id'>): Question {
    const nextId = this.data.questions.reduce((max, q) => q.id > max ? q.id : max, 0) + 1;
    const newQuestion: Question = { ...question, id: nextId };
    this.data.questions.push(newQuestion);
    this.save();
    return newQuestion;
  }

  public updateQuestion(id: number, updates: Partial<Omit<Question, 'id'>>): Question | undefined {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return undefined;
    this.data.questions[index] = { ...this.data.questions[index], ...updates };
    this.save();
    return this.data.questions[index];
  }

  public deleteQuestion(id: number): boolean {
    const initialLen = this.data.questions.length;
    this.data.questions = this.data.questions.filter(q => q.id !== id);
    if (this.data.questions.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Assessments Table CRUD ---
  public getAssessments(): Assessment[] {
    return this.data.assessments.map(as => {
      const u = this.getUserById(as.user_id);
      return {
        ...as,
        user_name: u ? u.name : 'Unknown User',
      };
    });
  }

  public getAssessmentsByUserId(userId: number): Assessment[] {
    return this.data.assessments
      .filter(as => as.user_id === userId)
      .map(as => {
        const u = this.getUserById(as.user_id);
        return {
          ...as,
          user_name: u ? u.name : 'Unknown User',
        };
      });
  }

  public createAssessment(assessment: Omit<Assessment, 'id'>): Assessment {
    const nextId = this.data.assessments.reduce((max, a) => a.id > max ? a.id : max, 0) + 1;
    const newAssessment: Assessment = { ...assessment, id: nextId };
    this.data.assessments.push(newAssessment);
    this.save();
    return newAssessment;
  }

  public deleteAssessment(id: number): boolean {
    const initialLen = this.data.assessments.length;
    this.data.assessments = this.data.assessments.filter(as => as.id !== id);
    if (this.data.assessments.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Recommendations Table CRUD ---
  public getRecommendations(): Recommendation[] {
    return this.data.recommendations;
  }

  public getRecommendationByDosha(dosha: 'Vata' | 'Pitta' | 'Kapha'): Recommendation | undefined {
    return this.data.recommendations.find(r => r.dosha_type === dosha);
  }

  public createRecommendation(rec: Omit<Recommendation, 'id'>): Recommendation {
    const nextId = this.data.recommendations.reduce((max, r) => r.id > max ? r.id : max, 0) + 1;
    const newRec: Recommendation = { ...rec, id: nextId };
    this.data.recommendations.push(newRec);
    this.save();
    return newRec;
  }

  public updateRecommendation(id: number, updates: Partial<Omit<Recommendation, 'id'>>): Recommendation | undefined {
    const index = this.data.recommendations.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.data.recommendations[index] = { ...this.data.recommendations[index], ...updates };
    this.save();
    return this.data.recommendations[index];
  }
}

export const db = new Database();
