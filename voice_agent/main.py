import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

load_dotenv()

app = FastAPI(title="Audio to n8n Webhook", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# Get n8n webhook URL from environment or use default
n8n_webhook_url = 'http://localhost:5678/webhook-test/8802c407-2f10-4cf0-882b-4c3f0539f62b'

# Serve static files (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("index.html")

@app.post("/api/record")
async def process_audio(audio: UploadFile = File(...)):
    """Process audio file and forward to n8n webhook"""
    try:
        # Validate file
        if not audio.filename:
            raise HTTPException(status_code=400, detail="No audio file selected")
        
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read file content
        audio_content = await audio.read()
        
        # Forward the audio to n8n webhook
        files = {'audio': (audio.filename, audio_content, audio.content_type)}
        
        response = requests.post(n8n_webhook_url, files=files)
        
        if response.status_code == 200:
            # Return the response from n8n (could be audio data or JSON)
            content_type = response.headers.get('content-type', 'application/octet-stream')
            return Response(content=response.content, media_type=content_type)
        else:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"n8n returned status {response.status_code}: {response.text}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "Python backend running", 
        "n8n_webhook": n8n_webhook_url,
        "framework": "FastAPI"
    }

if __name__ == '__main__':
    print(f"Starting FastAPI backend on port 8000...")
    print(f"Forwarding audio to n8n webhook: {n8n_webhook_url}")
    print("Access the app at: http://localhost:8000")
    print("For development with reload, use: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)