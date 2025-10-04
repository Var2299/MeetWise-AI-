# ⚡ MeetWise AI: High-Performance Meeting Summarizer

A full-stack application leveraging the **Gemini 2.5 Flash API** and **Next.js** to deliver rapid, highly condensed meeting transcripts and automate distribution via email. This project demonstrates optimized API route performance and efficient use of Google's Generative AI.

## 🚀 Key Performance & Efficiency Metrics

This project was built and instrumented to achieve demonstrable, quantifiable results:

| Metric | Value | Proof |
| :--- | :--- | :--- |
| **Average Latency (API)** | **$\mathbf{5.71\text{ seconds}}$** | Time taken for the Gemini API call and route execution across multiple runs for 1000-word inputs. (See **`benchmark/`** for logs) |
| **Text Reduction** | **$\mathbf{62.5%}$%** | Average reduction ratio for $1000\text{-word}$ meeting transcripts to a $375\text{-word}$ summary output. |
| **Model Used** | **`gemini-2.5-flash`** | Selected for its speed and high reasoning capability, crucial for low-latency delivery. |

---

## ✨ Features & Functionality

* **Fast Summarization:** Takes raw meeting transcripts (e.g., from Zoom/Meet) as input and uses a carefully tuned prompt to generate a structured summary.
* **Actionable Output:** Summaries are configured to prioritize key takeaways, decisions, and action items, not just generic text.
* **Automated Email Dispatch:** The final summary output is immediately structured and prepared for sending to relevant users via a connected email service (e.g., Gmail integration).
* **Optimized API Route:** Performance instrumentation is built directly into the Next.js API route to accurately measure and minimize server-side latency.

---

## 🛠️ Tech Stack & Architecture

### Frontend
* **Next.js 15 (App Router):** Modern React framework for routing and server components.
* **React:** Building the user interface for transcript input and summary display.
* **Tailwind CSS:** Utility-first framework for rapid, responsive styling.

### Backend & AI Core
* **Gemini 2.5 Flash:** The core LLM providing high-speed, high-quality summarization.
* **Google GenAI SDK (Node.js):** Used to interface with the Gemini API.
* **Next.js API Routes:** Serverless functions handle the secure processing of the transcript and the Gemini API call.
* **Node.js `performance.now()`:** Used for granular measurement of API latency and total route execution time.

---

## ⚙️ Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone [YOUR_REPO_URL]
    cd flash-ai-digest
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
   ## ⚙️ Setup and Installation (Cont.)

### 3. Configure Environment Variables

This project relies on several external services. To run the application locally, you must create a file named **`.env.local`** in the root of the project directory.

**⚠️ Security Warning:**
* ***NEVER*** commit your actual `.env.local` file to Git, as it contains sensitive API keys and credentials.
* Ensure that `.env.local` is listed in your project's `.gitignore` file.

Populate the newly created `.env.local` file with the following variables:

# =========================================================
# CORE AI SERVICE - Gemini API Key
# Required for all summarization and content generation calls.
# =========================================================
GEMINI_API_KEY="AIzaSy...your_new_gemini_key_here..."

# =========================================================
# DATABASE (MONGODB) - Used for storing transcript history/user data (Optional)
# =========================================================
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
MONGODB_DB="your_database_name"

# =========================================================
# EMAIL DISPATCH SERVICE - SMTP Credentials
# Used for the final step of automated summary distribution via email.
# (Example: Configure for Gmail App Passwords, SendGrid, Mailgun, etc.)
# =========================================================
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASS="your_app_password"

4.  **Run Locally:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---
