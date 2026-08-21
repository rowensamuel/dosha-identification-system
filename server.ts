import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { db, User, Question, Assessment, Recommendation } from "./server/db.ts";
import { askAyurvedaAI } from "./server/gemini.ts";

const app = express();
const PORT = 3001;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Authentication Helpers & Middleware ---
const SECRET_KEY = "ayurveda-secret-salt-key-2026";

// Simple and robust cryptographic token format
// Format: userId.expiryTimestamp.hmacSignature
function generateToken(userId: number): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${userId}.${expiry}`;
  const hmac = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
  return Buffer.from(`${payload}.${hmac}`).toString("base64");
}

function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [userIdStr, expiryStr, signature] = decoded.split(".");
    if (!userIdStr || !expiryStr || !signature) return null;

    const userId = parseInt(userIdStr, 10);
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) return null; // Expired

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${userIdStr}.${expiryStr}`)
      .digest("hex");

    if (signature !== expectedSignature) return null; // Invalid signature

    return userId;
  } catch (err) {
    return null;
  }
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Access denied. Token expired or invalid." });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "Access denied. User not found." });
  }

  req.user = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Access forbidden. Administrator permissions required." });
  }
  next();
}

// --- API ENDPOINTS ---

// 1. Authentication Module API
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, age, gender } = req.body;

  if (!name || !email || !password || !age || !gender) {
    return res.status(400).json({ error: "Please fill out all required fields." });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const user = db.createUser({
    name,
    email,
    passwordHash,
    age: parseInt(age, 10) || 25,
    gender,
    isAdmin: email.toLowerCase() === "admin@ayurveda.org" || false,
  });

  const token = generateToken(user.id);
  res.status(201).json({
    message: "Registration successful!",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      isAdmin: user.isAdmin,
    }
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken(user.id);
  res.json({
    message: "Welcome back!",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      isAdmin: user.isAdmin,
    }
  });
});

app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required." });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "User with this email was not found." });
  }

  const newHash = crypto.createHash("sha256").update(newPassword).digest("hex");
  db.updatePassword(user.id, newHash);

  res.json({ message: "Password updated successfully! Please login with your new credentials." });
});

// --- End Password Reset / Configuration ---

app.get("/api/auth/profile", authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      isAdmin: user.isAdmin,
    }
  });
});

app.put("/api/auth/profile", authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, age, gender } = req.body;

  if (!name || !age || !gender) {
    return res.status(400).json({ error: "Name, age, and gender are required." });
  }

  const updated = db.updateUser(user.id, {
    name,
    age: parseInt(age, 10) || user.age,
    gender,
  });

  res.json({
    message: "Profile updated successfully!",
    user: updated ? {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      age: updated.age,
      gender: updated.gender,
      isAdmin: updated.isAdmin,
    } : null
  });
});

// 2. Questions API Module
app.get("/api/questions", (req: Request, res: Response) => {
  res.json(db.getQuestions());
});

app.post("/api/questions", authenticateUser, requireAdmin, (req: Request, res: Response) => {
  const { question, category, options } = req.body;
  if (!question || !category || !options || !Array.isArray(options)) {
    return res.status(400).json({ error: "Missing required question parameters." });
  }

  const newQuestion = db.createQuestion({ question, category, options });
  res.status(201).json({ message: "Question created successfully!", question: newQuestion });
});

app.put("/api/questions/:id", authenticateUser, requireAdmin, (req: Request, res: Response) => {
  const qId = parseInt(req.params.id, 10);
  const updates = req.body;
  
  const updated = db.updateQuestion(qId, updates);
  if (!updated) {
    return res.status(404).json({ error: "Question not found." });
  }

  res.json({ message: "Question updated successfully!", question: updated });
});

app.delete("/api/questions/:id", authenticateUser, requireAdmin, (req: Request, res: Response) => {
  const qId = parseInt(req.params.id, 10);
  const success = db.deleteQuestion(qId);
  if (!success) {
    return res.status(404).json({ error: "Question not found." });
  }
  res.json({ message: "Question deleted successfully!" });
});

// 3. Dosha Assessment & Core Rule Engine Module
app.post("/api/assessments", authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { answers } = req.body; // Map of questionId -> selectedOptionIndex (0, 1, or 2)

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Invalid answers submitted." });
  }

  // --- CORE MODULE: Expert System Rule Engine ---
  // Default base scores
  let vata_score = 0;
  let pitta_score = 0;
  let kapha_score = 0;

  const questions = db.getQuestions();

  // Evaluate answers using rule-based scoring
  Object.entries(answers).forEach(([qIdStr, optIdxVal]) => {
    const qId = parseInt(qIdStr, 10);
    const optIdx = parseInt(optIdxVal as string, 10);
    const q = questions.find(question => question.id === qId);

    if (q && q.options[optIdx]) {
      const option = q.options[optIdx];
      
      // Apply Expert Rules
      // IF option = dry skin THEN Vata += 2
      // IF body build = medium BUILD THEN Pitta += 2
      // IF sleep = deep sleep THEN Kapha += 2
      if (option.type === "vata") {
        vata_score += option.value;
      } else if (option.type === "pitta") {
        pitta_score += option.value;
      } else if (option.type === "kapha") {
        kapha_score += option.value;
      }
    }
  });

  // Calculate final percentage distribution
  const total_score = vata_score + pitta_score + kapha_score;
  let dominant_dosha = "Tridoshic";

  if (total_score > 0) {
    const vata_percent = (vata_score / total_score) * 100;
    const pitta_percent = (pitta_score / total_score) * 100;
    const kapha_percent = (kapha_score / total_score) * 100;

    // Expert Rule logic to find dominant dosha
    // 1. Single dominance if highest is > 10% more than second highest
    // 2. Dual dominance if top two are within 10% of each other
    // 3. Tridoshic if all three are within 10%
    const scores = [
      { name: "Vata", score: vata_percent },
      { name: "Pitta", score: pitta_percent },
      { name: "Kapha", score: kapha_percent }
    ].sort((a, b) => b.score - a.score);

    const diff1_2 = scores[0].score - scores[1].score;
    const diff2_3 = scores[1].score - scores[2].score;

    if (scores[0].score - scores[2].score <= 10) {
      dominant_dosha = "Tridoshic";
    } else if (diff1_2 <= 8) {
      // Dual dominant
      dominant_dosha = `${scores[0].name}-${scores[1].name}`;
    } else {
      // Single dominant
      dominant_dosha = scores[0].name;
    }
  }

  // Store in DB
  const assessment = db.createAssessment({
    user_id: user.id,
    vata_score,
    pitta_score,
    kapha_score,
    dominant_dosha,
    assessment_date: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Assessment computed successfully by rule engine!",
    assessment: {
      ...assessment,
      user_name: user.name,
    }
  });
});

app.get("/api/assessments", authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.isAdmin) {
    // Admin gets ALL previous assessments
    res.json(db.getAssessments());
  } else {
    // Normal user gets ONLY their assessments
    res.json(db.getAssessmentsByUserId(user.id));
  }
});

app.delete("/api/assessments/:id", authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const assId = parseInt(req.params.id, 10);

  // If not admin, verify ownership
  const assessments = db.getAssessments();
  const found = assessments.find(a => a.id === assId);

  if (!found) {
    return res.status(404).json({ error: "Assessment report not found." });
  }

  if (!user.isAdmin && found.user_id !== user.id) {
    return res.status(403).json({ error: "Access forbidden. You do not own this report." });
  }

  db.deleteAssessment(assId);
  res.json({ message: "Assessment report deleted successfully!" });
});

// 4. Recommendations API Module
app.get("/api/recommendations/:dosha", (req: Request, res: Response) => {
  const dosha = req.params.dosha as 'Vata' | 'Pitta' | 'Kapha';
  const rec = db.getRecommendationByDosha(dosha);
  if (!rec) {
    return res.status(404).json({ error: `Recommendations for ${dosha} not found.` });
  }
  res.json(rec);
});

app.get("/api/recommendations", authenticateUser, requireAdmin, (req: Request, res: Response) => {
  res.json(db.getRecommendations());
});

app.put("/api/recommendations/:id", authenticateUser, requireAdmin, (req: Request, res: Response) => {
  const recId = parseInt(req.params.id, 10);
  const updates = req.body;

  const updated = db.updateRecommendation(recId, updates);
  if (!updated) {
    return res.status(404).json({ error: "Recommendation not found." });
  }

  res.json({ message: "Recommendation updated successfully!", recommendation: updated });
});

// 5. Admin Dashboard Statistics API Module
app.get("/api/admin/stats", authenticateUser, requireAdmin, (req: Request, res: Response) => {
  const users = db.getUsers();
  const assessments = db.getAssessments();

  // Dominant dosha count
  const doshaCounts: Record<string, number> = {};
  assessments.forEach(a => {
    doshaCounts[a.dominant_dosha] = (doshaCounts[a.dominant_dosha] || 0) + 1;
  });

  // Average scores
  let totalVata = 0;
  let totalPitta = 0;
  let totalKapha = 0;
  assessments.forEach(a => {
    totalVata += a.vata_score;
    totalPitta += a.pitta_score;
    totalKapha += a.kapha_score;
  });

  const totalAss = assessments.length || 1;

  res.json({
    totalUsers: users.length,
    totalAssessments: assessments.length,
    doshaDistribution: Object.entries(doshaCounts).map(([name, value]) => ({ name, value })),
    averageScores: {
      Vata: parseFloat((totalVata / totalAss).toFixed(1)),
      Pitta: parseFloat((totalPitta / totalAss).toFixed(1)),
      Kapha: parseFloat((totalKapha / totalAss).toFixed(1)),
    }
  });
});

// 6. AI Consultant Consultation API
app.post("/api/gemini/consult", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, chatHistory } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required and must be a string." });
  }

  const reply = await askAyurvedaAI(prompt, chatHistory);
  res.json({ reply });
});

// --- CLIENT STATIC AND VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ayurveda Expert System] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
