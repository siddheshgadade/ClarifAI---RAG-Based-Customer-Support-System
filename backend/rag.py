import os
import pickle
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Try to import Google Gemini, fall back to HuggingFace embeddings if quota exceeded
try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
    USE_GEMINI = True
except:
    USE_GEMINI = False

from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

class RAGService:
    def __init__(self):
        self.vector_store_path = "./faiss_index"
        
        # Check for API Key
        api_key = os.getenv("GOOGLE_API_KEY")
        
        # Try to use Gemini, fall back to local embeddings if quota exceeded
        try:
            if api_key and USE_GEMINI:
                print("Attempting to use Google Gemini embeddings...")
                self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
                # Test the embeddings with a small query
                test_result = self.embeddings.embed_query("test")
                print("✓ Google Gemini embeddings initialized successfully")
                self.using_gemini_embeddings = True
            else:
                raise ValueError("No API key or Gemini not available")
        except Exception as e:
            print(f"⚠ Google Gemini embeddings unavailable (quota or error): {e}")
            print("→ Falling back to local HuggingFace embeddings (all-MiniLM-L6-v2)")
            # Use local embeddings as fallback
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
            self.using_gemini_embeddings = False
            print("✓ Local embeddings initialized successfully")
        
        # Try to initialize Gemini LLM separately (for answer generation)
        try:
            if api_key and USE_GEMINI:
                print("Attempting to initialize Google Gemini LLM for answer generation...")
                self.llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
                # Test with a simple query
                test_response = self.llm.invoke("Hi")
                print("✓ Google Gemini LLM initialized successfully")
                self.using_gemini_llm = True
            else:
                raise ValueError("No API key")
        except Exception as e:
            print(f"⚠ Google Gemini LLM unavailable: {e}")
            print("→ Will use context-only responses")
            self.llm = None
            self.using_gemini_llm = False
        
        # Initialize or load Vector Store
        if os.path.exists(f"{self.vector_store_path}.pkl"):
            with open(f"{self.vector_store_path}.pkl", "rb") as f:
                self.vector_store = pickle.load(f)
            print(f"✓ Loaded existing vector store from {self.vector_store_path}.pkl")
        else:
            self.vector_store = None
        
        self.retriever = None

    def ingest_document(self, file_path: str):
        """Ingests a document (PDF or TXT) into the vector store."""
        print(f"Loading document: {file_path}")
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path, encoding='utf-8')
            
        documents = loader.load()
        print(f"Loaded {len(documents)} pages/sections")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_documents(documents)
        print(f"Split into {len(texts)} chunks")
        
        # Create or update vector store
        print("Creating embeddings...")
        # Always overwrite with a fresh vector store for the new document
        self.vector_store = FAISS.from_documents(texts, self.embeddings)
        
        # Save vector store
        with open(f"{self.vector_store_path}.pkl", "wb") as f:
            pickle.dump(self.vector_store, f)
        print(f"✓ Vector store saved to {self.vector_store_path}.pkl")
        
        # Update retriever
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})
        
        return len(texts)

    def ask_question(self, query: str):
        """Asks a question to the RAG pipeline."""
        
        if self.vector_store is None:
            return {
                "answer": "No documents have been uploaded yet. Please upload a document first.",
                "sources": []
            }
        
        # Update retriever if needed
        if self.retriever is None:
            self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})
        
        # Retrieve relevant documents
        docs = self.retriever.invoke(query)
        
        # Format context from retrieved documents
        context = "\n\n".join([doc.page_content for doc in docs])
        sources = [doc.metadata.get("source", "Unknown") for doc in docs]
        
        # Generate answer
        if self.using_gemini_llm and self.llm:
            # Use Gemini for generation
            template = """Use the following pieces of context to answer the question at the end. 
            If you don't know the answer, just say that you don't know, don't try to make up an answer. 
            Keep the answer helpful and professional.
            
            Context:
            {context}
            
            Question: {question}
            
            Helpful Answer:"""
            
            prompt = PromptTemplate.from_template(template)
            
            chain = (
                {"context": lambda x: context, "question": RunnablePassthrough()}
                | prompt
                | self.llm
                | StrOutputParser()
            )
            
            answer = chain.invoke(query)
        else:
            # Enhanced fallback: return the most relevant document chunks directly
            if not docs:
                answer = "Could not find relevant information in the uploaded documents."
            else:
                relevant_text = []
                for i, doc in enumerate(docs[:3]): # Take top 3 most relevant chunks
                    content = doc.page_content.strip()
                    if content:
                        relevant_text.append(f"📌 **Relevant Excerpt {i+1}:**\n{content}")
                
                answer = "\n\n".join(relevant_text)
        
        return {
            "answer": answer,
            "sources": list(set(sources))  # Remove duplicates
        }
