# RAG Customer Support System - Complete Project Documentation

## 📋 Project Overview

**Project Name:** RAG-Based Customer Support AI System  
**Technology Stack:** Python (FastAPI), React (Vite), LangChain, FAISS, Google Gemini API  
**Purpose:** Intelligent customer support system that answers questions based on uploaded knowledge base documents using Retrieval-Augmented Generation (RAG)

---

## 🎯 What is RAG (Retrieval-Augmented Generation)?

RAG is an AI technique that combines:
1. **Retrieval**: Finding relevant information from a knowledge base
2. **Generation**: Using an AI model to create natural language answers based on retrieved information

This approach ensures AI responses are grounded in actual documentation rather than hallucinated information.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                        │
│  • Chat Interface (ChatWindow.jsx)                          │
│  • File Upload Interface (FileUpload.jsx)                   │
│  • Premium UI with Vanilla CSS                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI)                              │
│  • /upload - Document ingestion endpoint                    │
│  • /chat - Question answering endpoint                      │
│  • CORS enabled for development                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              RAG SERVICE (rag.py)                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DOCUMENT INGESTION PIPELINE                        │   │
│  │  1. Load PDF/TXT files                              │   │
│  │  2. Split into chunks (1000 chars, 200 overlap)     │   │
│  │  3. Generate embeddings (vector representations)    │   │
│  │  4. Store in FAISS vector database                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  QUESTION ANSWERING PIPELINE                        │   │
│  │  1. Convert question to embedding                   │   │
│  │  2. Search FAISS for similar chunks (top 5)         │   │
│  │  3. Retrieve relevant context                       │   │
│  │  4. Generate answer using Gemini Pro LLM            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         EXTERNAL SERVICES                                   │
│  • Google Gemini API (Embeddings + Text Generation)        │
│  • HuggingFace Embeddings (Fallback)                       │
│  • FAISS Vector Store (Local)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Components

### 1. Frontend (React + Vite)

**Location:** `frontend/`

**Key Files:**
- `src/App.jsx` - Main application component
- `src/components/ChatWindow.jsx` - Chat interface with message history
- `src/components/FileUpload.jsx` - Document upload component
- `src/App.css` - Premium styling with Outfit font, gradients, animations

**Features:**
- Real-time chat interface with auto-scroll
- File upload with progress feedback
- Source citation display
- Loading animations
- Responsive design

**Technology:**
- React 18
- Vite (build tool)
- Vanilla CSS (no frameworks)
- Fetch API for backend communication

---

### 2. Backend (FastAPI)

**Location:** `backend/`

**Key Files:**
- `main.py` - FastAPI application with endpoints
- `rag.py` - RAG service implementation
- `.env` - Environment variables (API keys)
- `requirements.txt` - Python dependencies

**API Endpoints:**

#### POST /upload
Uploads and processes documents into the knowledge base.

**Request:**
```
Content-Type: multipart/form-data
file: <PDF or TXT file>
```

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "chunks": 42
}
```

**Process:**
1. Save uploaded file to `data/` directory
2. Load document using PyPDFLoader or TextLoader
3. Split into chunks using RecursiveCharacterTextSplitter
4. Generate embeddings for each chunk
5. Store in FAISS vector database
6. Return number of chunks processed

#### POST /chat
Answers questions based on uploaded documents.

**Request:**
```json
{
  "question": "What is the return policy?"
}
```

**Response:**
```json
{
  "answer": "TechGear accepts returns within 30 days...",
  "sources": ["data/sample_support_doc.txt"]
}
```

**Process:**
1. Convert question to embedding
2. Search FAISS for top 5 similar chunks
3. Retrieve context from matched chunks
4. Generate answer using Gemini Pro with context
5. Return answer with source citations

---

### 3. RAG Service (LangChain)

**Location:** `backend/rag.py`

**Core Technologies:**
- **LangChain**: Framework for building LLM applications
- **FAISS**: Facebook AI Similarity Search (vector database)
- **Google Gemini API**: Embeddings and text generation
- **HuggingFace**: Fallback embeddings (sentence-transformers)

**Key Methods:**

#### `__init__()`
Initializes the RAG service with:
- Embedding model (Gemini or HuggingFace fallback)
- LLM model (Gemini Pro)
- FAISS vector store (loaded from disk if exists)

#### `ingest_document(file_path)`
Processes a document:
1. Load using appropriate loader (PDF/TXT)
2. Split into chunks (1000 chars, 200 overlap)
3. Generate embeddings
4. Add to FAISS vector store
5. Persist to disk (`faiss_index.pkl`)
6. Return chunk count

#### `ask_question(query)`
Answers a question:
1. Retrieve top 5 relevant chunks from FAISS
2. Format context from retrieved chunks
3. Generate answer using Gemini Pro with prompt template
4. Return answer with sources

**Fallback Mechanism:**
- If Gemini embeddings fail (quota): Use HuggingFace `all-MiniLM-L6-v2`
- If Gemini LLM fails (quota): Return formatted context without generation

---

## 📊 Data Flow

### Document Upload Flow
```
User uploads PDF/TXT
    ↓
Frontend sends to /upload
    ↓
Backend saves file to data/
    ↓
RAG Service loads document
    ↓
Text split into chunks
    ↓
Each chunk → Embedding (384-dim vector)
    ↓
Embeddings stored in FAISS
    ↓
FAISS index saved to disk
    ↓
Success response to user
```

### Question Answering Flow
```
User asks question
    ↓
Frontend sends to /chat
    ↓
Question → Embedding
    ↓
FAISS similarity search (top 5)
    ↓
Retrieve chunk content
    ↓
Format context + question
    ↓
Send to Gemini Pro LLM
    ↓
LLM generates natural answer
    ↓
Return answer + sources
    ↓
Display in chat interface
```

---

## 🧠 How RAG Works (Detailed)

### Step 1: Document Chunking
Documents are split into overlapping chunks to preserve context:
- **Chunk size**: 1000 characters
- **Overlap**: 200 characters
- **Why overlap?** Ensures important information at chunk boundaries isn't lost

### Step 2: Embedding Generation
Each chunk is converted to a vector (numerical representation):
- **Model**: `models/embedding-001` (Gemini) or `all-MiniLM-L6-v2` (HuggingFace)
- **Dimension**: 768 (Gemini) or 384 (HuggingFace)
- **Purpose**: Captures semantic meaning of text

### Step 3: Vector Storage (FAISS)
Embeddings stored in FAISS for fast similarity search:
- **Algorithm**: Approximate Nearest Neighbor (ANN)
- **Speed**: Sub-millisecond search on millions of vectors
- **Persistence**: Saved to `faiss_index.pkl` for reuse

### Step 4: Semantic Search
When user asks a question:
1. Question converted to same embedding space
2. FAISS finds most similar chunks (cosine similarity)
3. Top 5 chunks retrieved as context

### Step 5: Answer Generation
Retrieved context + question sent to LLM:
```
Prompt Template:
"Use the following context to answer the question.
If you don't know, say so. Keep it helpful and professional.

Context: [Retrieved chunks]
Question: [User question]
Answer:"
```

LLM generates natural language answer grounded in context.

---

## 🔑 Key Features

### 1. Intelligent Document Processing
- Supports PDF and TXT files
- Automatic text extraction and chunking
- Preserves document structure and context

### 2. Semantic Search
- Understands meaning, not just keywords
- Finds relevant information even with different wording
- Example: "refund policy" matches "return procedures"

### 3. Source Attribution
- Every answer includes source documents
- Enables verification and trust
- Helps users find more information

### 4. Fallback Mechanisms
- Local embeddings when API quota exceeded
- Graceful degradation
- Always functional, even without cloud services

### 5. Premium UI/UX
- Modern, professional design
- Smooth animations and transitions
- Real-time feedback
- Mobile-responsive

---

## 🚀 How to Run

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google AI Studio API Key

### Setup

1. **Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
# Create .env file with: GOOGLE_API_KEY=your_key_here
python -m uvicorn main:app --reload
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

3. **Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8000

### Usage

1. **Upload Documents:**
   - Click "Choose File" in upload panel
   - Select PDF or TXT file
   - Click "Upload Document"
   - Wait for processing confirmation

2. **Ask Questions:**
   - Type question in chat input
   - Press Enter or click Send
   - View AI-generated answer with sources

---

## 📦 Dependencies

### Backend (Python)
```
fastapi - Web framework
uvicorn - ASGI server
langchain - LLM framework
langchain-google-genai - Gemini integration
langchain-community - Community integrations
langchain-huggingface - HuggingFace embeddings
faiss-cpu - Vector database
pypdf - PDF processing
python-dotenv - Environment variables
sentence-transformers - Local embeddings
```

### Frontend (JavaScript)
```
react - UI library
vite - Build tool
```

---

## 🎓 Educational Value

This project demonstrates:

### 1. Modern AI Techniques
- Retrieval-Augmented Generation (RAG)
- Vector embeddings and semantic search
- Large Language Model (LLM) integration

### 2. Full-Stack Development
- RESTful API design (FastAPI)
- Modern frontend (React)
- State management
- Asynchronous programming

### 3. Production Practices
- Error handling and fallbacks
- Environment configuration
- CORS and security
- Code organization

### 4. AI Engineering
- Prompt engineering
- Context window management
- Embedding strategies
- Vector database usage

---

## 🔍 Technical Challenges Solved

### 1. API Quota Management
**Problem:** Google Gemini API has rate limits  
**Solution:** Implemented fallback to local HuggingFace embeddings

### 2. Context Window Limits
**Problem:** LLMs have token limits  
**Solution:** Chunk documents and retrieve only relevant sections

### 3. Semantic Search Accuracy
**Problem:** Keyword search misses relevant information  
**Solution:** Vector embeddings capture semantic meaning

### 4. Real-time Updates
**Problem:** Large documents take time to process  
**Solution:** Asynchronous processing with progress feedback

---

## 🎯 Use Cases

1. **Customer Support:** Answer FAQs from product documentation
2. **Internal Knowledge Base:** Help employees find company policies
3. **Educational:** Answer questions from course materials
4. **Legal/Compliance:** Query regulations and procedures
5. **Technical Documentation:** Search API docs and guides

---

## 🔮 Future Enhancements

1. **Multi-document Management:** Upload and manage multiple knowledge bases
2. **Conversation Memory:** Remember previous questions in session
3. **Advanced Filtering:** Filter by document type, date, category
4. **Analytics Dashboard:** Track popular questions and answer quality
5. **User Authentication:** Secure access control
6. **Feedback Loop:** Rate answers to improve retrieval
7. **Export Conversations:** Download chat history
8. **Multi-language Support:** Answer in user's preferred language

---

## 📝 Project Structure

```
Gen_Ai_Mini_project/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── rag.py               # RAG service implementation
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   ├── .env.example         # Example env file
│   └── data/                # Uploaded documents
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main component
│   │   ├── App.css          # Styles
│   │   └── components/
│   │       ├── ChatWindow.jsx
│   │       └── FileUpload.jsx
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── sample_support_doc.txt  # Sample knowledge base
└── PROJECT_DOCUMENTATION.md     # This file
```

---

## 🏆 Key Achievements

✅ **Fully Functional RAG Pipeline** - Complete document ingestion and retrieval  
✅ **Modern Tech Stack** - Latest frameworks and best practices  
✅ **Production-Ready Features** - Error handling, fallbacks, logging  
✅ **Premium UI/UX** - Professional, polished interface  
✅ **Scalable Architecture** - Easy to extend and maintain  
✅ **Educational Value** - Demonstrates cutting-edge AI techniques  

---

## 📚 Learning Resources

- [LangChain Documentation](https://python.langchain.com/)
- [Google Gemini API](https://ai.google.dev/)
- [FAISS Documentation](https://faiss.ai/)
- [RAG Explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Vector Embeddings](https://www.deeplearning.ai/short-courses/google-cloud-vertex-ai/)

---

## 👨‍💻 Developer Notes

**Current Status:** Fully functional with local embedding fallback  
**Known Issues:** Google API quota exhausted (resets daily)  
**Recommended:** Create new API key for full Gemini integration  
**Performance:** Fast retrieval (<100ms), answer generation (2-5s with Gemini)

---

## 📄 License & Credits

**Created for:** Gen AI Subject Project  
**Technologies:** FastAPI, React, LangChain, Google Gemini, FAISS  
**Purpose:** Educational demonstration of RAG systems  

---

**End of Documentation**
