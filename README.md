# Ayurveda Dosha Identification Expert System

An interactive full-stack web platform built to identify a user's dominant Ayurvedic Dosha (**Vata**, **Pitta**, **Kapha**) by coupling classic clinical diagnoses (from ancient Indian Knowledge Systems - IKS) with modern algorithmic rule-engines, charts, and secure, context-aware Generative AI.

---

## 🚀 Key Modules & Architecture

The application is structured into 8 cohesive functional modules:

1. **Home Panel / IKS Overview**: Detailed explanations of the Tridoshic elements (Vata, Pitta, Kapha), and deep technical context explaining how this system acts as a computational rule-based classification model (Decision Trees & Inference Engines).
2. **User Authentication**: A custom, cryptographically secure JWT/session token system supporting Registration, Logins, and Secure Password resets.
3. **Interactive Questionnaire**: 30 comprehensive physiological and behavioral diagnostic questions divided across physical traits, metabolic traits, and psychological resilience, displaying progress with interactive cards.
4. **Expert System Rule Engine**: Server-side algorithmic evaluation. Scoring options weight Vata, Pitta, or Kapha dynamically to calculate proportional distribution percentages and classify the final dominant constitutional type.
5. **Results Analytics Dashboard**: Visualizations of the user's Tridoshic distribution using **Recharts Pie and Bar charts**, a custom visual wellness meter, and quick download configurations.
6. **AI Ayurvedic Consultant**: An interactive client chat panel proxying queries server-side via the **Gemini-3.5-flash** model. This provides highly personalized, context-aware wellness feedback based on their real assessment scores.
7. **Assessment History & Progress Tracker**: Store and retrieve prior reports to track constitutional changes chronologically over time.
8. **Admin Panel**: Live statistics showing total users, assessment breakdowns, complete CRUD access to the Question Bank, and ability to update recommendation guidelines directly in the Knowledge Base.

---

## 📊 Database Schema Details

The database manages four primary relational entities:

*   **`users`**: User records, age, gender demographics, and administrator privileges.
*   **`questions`**: Active diagnostic questions and element categories.
*   **`assessments`**: Diagnostic scores (Vata/Pitta/Kapha points) and dominant dosha classifications with date stamps.
*   **`recommendations`**: Dietary pacification rules (foods to eat/avoid), exercises, yoga poses, and sleep parameters mapped to each primary Dosha.

A full MySQL deployment script is provided directly in **`/database.sql`**.

---

## ⚙️ Tech Stack & Dev Setup

### Tech Stack
*   **Frontend**: React (v19) + Tailwind CSS (v4) + motion (animations) + Recharts (charts).
*   **Backend**: Node.js + Express (full-stack environment).
*   **Database**: Durable local asynchronous JSON database (auto-seeding on boot) + exportable MySQL scripts.
*   **AI**: `@google/genai` TypeScript SDK (server-side only, hiding API keys).

### Local Deployment
To run this application locally on your machine, follow these steps:

1.  **Clone/Extract Files**: Ensure you have the full repository files in your workspace.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Add your Gemini API key inside a `.env` file at the root:
    ```env
    GEMINI_API_KEY="your-actual-api-key"
    ```
4.  **Launch Dev Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` inside your browser to view the live dashboard!

5.  **Compile & Build for Production**:
    ```bash
    npm run build
    npm start
    ```
