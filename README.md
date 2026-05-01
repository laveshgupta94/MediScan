# MediScan 💊

MediScan is an AI-powered medical information platform designed to help users identify medications and understand their prescriptions instantly. Using advanced Vision AI (Meta Llama 4) and Large Language Models (Meta Llama 3.3) via the Groq API, MediScan extracts medicine details from images and provides a context-aware chat assistant (MediBot) for follow-up questions.

## ✨ Features

- **AI Medicine Scanner**: Upload an image of a medicine strip, bottle, or prescription to get instant details:
  - Medicine Name & Generic Name
  - Manufacturer Information
  - Primary Uses & Typical Dosage
  - Side Effects & Important Warnings
- **MediBot Assistant**: A specialized medical AI chatbot that maintains context from your scan to answer specific questions about your medication.
- **Premium Dark UI**: A modern, responsive interface built with Glassmorphism, smooth animations, and a focus on accessibility.
- **Instant Analysis**: Powered by Groq LPU™ Inference Engine for near-instant AI responses.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Vanilla CSS (Custom Design System), FontAwesome.
- **Backend**: Python (FastAPI), Uvicorn, Pydantic.
- **AI Engine**: Groq API
  - **Vision/Multimodal**: `meta-llama/llama-4-scout-17b-16e-instruct`
  - **Chat/Reasoning**: `llama-3.3-70b-versatile`

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- [Groq API Key](https://console.groq.com/keys)

### Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MediScan
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   - Create a `.env` file in the `backend` folder:
     ```env
     GROQ_API_KEY=your_groq_api_key_here
     PORT=5001
     ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   python main.py
   ```
   The API will be running at `http://localhost:5001`.

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## ⚠️ Disclaimer

MediScan is an educational tool and provides general information only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult with a licensed healthcare professional before taking any medication.

---
Built with ❤️ for MediScan.
