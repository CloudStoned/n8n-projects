# Voice Agent - Audio to n8n Webhook

Real-time audio recording and processing application that forwards audio to n8n webhooks.

## 🎯 Features

- Record audio directly from microphone
- Send to n8n workflows via webhooks
- Play audio responses from n8n
- Real-time audio preview
- Multiple format support

## 🏗️ Architecture

```
Frontend (HTML/JS) → FastAPI Backend → n8n Webhook → Frontend
```

## 📁 Files

- `index.html` - Main frontend interface
- `server.js` - Frontend JavaScript functionality
- `main.py` - FastAPI backend with audio processing
- `README.md` - This documentation

## 🚀 Setup

### Prerequisites

- Python 3.8+
- Modern web browser with microphone support
- n8n instance with webhook endpoint

### Installation

1. Install dependencies:

```bash
pip install fastapi uvicorn requests python-dotenv
```

2. Configure `.env` file:

```
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/your-webhook-id
```

3. Start server:

```bash
uv py main.py
```

4. Open browser: `http://localhost:8000`

## 📡 API Endpoints

| Method | Endpoint      | Description                      |
| ------ | ------------- | -------------------------------- |
| GET    | `/`           | Serve HTML interface             |
| POST   | `/api/record` | Process audio and forward to n8n |
| GET    | `/api/health` | Health check endpoint            |

## 🎮 Usage

### Recording Audio

1. Click "🎙️ Start Recording"
2. Grant microphone permissions when prompted
3. Click "⏹ Stop" when finished
4. Review recording in local player
5. Click "➡️ Send to server" to process

### Response Handling

- Audio responses play automatically
- Response details shown in status area
- Use "🗑️ Clear" button to reset interface

## 🔧 Configuration

### Environment Variables

```bash
N8N_WEBHOOK_URL=your-n8n-webhook-endpoint
```

### Supported Audio Formats

- **Input**: WebM, OGG, WAV, MP3, M4A, FLAC
- **Output**: Depends on n8n workflow response
- **Recording**: WebM with Opus codec (preferred)

## 🐛 Troubleshooting

### Common Issues

**Microphone not working**

- Check browser permissions
- Ensure HTTPS in production
- Try different browser

**CORS errors**

- Verify FastAPI CORS configuration
- Check API endpoint URLs

**n8n connection issues**

- Verify webhook URL is correct
- Check n8n instance is running

## License

MIT License - feel free to use and modify.
