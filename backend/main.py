from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from rag import RAGService
from pydantic import BaseModel

app = FastAPI(title="RAG Customer Support API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Service (Lazy load or global)
# We initialize it here, but it requires GOOGLE_API_KEY
try:
    rag_service = RAGService()
except ValueError as e:
    print(f"Error initializing RAG Service: {e}")
    rag_service = None

os.makedirs("data", exist_ok=True)

class ChatRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not rag_service:
        raise HTTPException(status_code=500, detail="RAG Service not initialized. Check server logs.")
    # Clear existing files in data directory to ensure only the most recently uploaded file is active
    for existing_file in os.listdir("data"):
        try:
            file_to_remove = os.path.join("data", existing_file)
            if os.path.isfile(file_to_remove):
                os.remove(file_to_remove)
        except Exception as e:
            print(f"Error removing old file {existing_file}: {e}")
            
    file_path = f"data/{file.filename}"
    print(f"Uploading file: {file.filename} to {file_path}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"File saved successfully: {file_path}")
    except Exception as e:
        print(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    try:
        print(f"Starting document ingestion...")
        num_chunks = rag_service.ingest_document(file_path)
        print(f"Document ingested successfully: {num_chunks} chunks")
        return {"message": "Document uploaded and processed successfully", "chunks": num_chunks}
    except Exception as e:
        print(f"Error ingesting document: {e}")
        import traceback
        traceback.print_exc()
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    if not rag_service:
        raise HTTPException(status_code=500, detail="RAG Service not initialized. Check server logs.")
    
    try:
        response = rag_service.ask_question(request.question)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "Customer Support RAG API is running"}
