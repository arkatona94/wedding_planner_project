# FASHN VTON v1.5 Backend

This is a FastAPI-based server for the FASHN VTON v1.5 Virtual Try-On model.

## Prerequisites

- Python 3.10+
- NVIDIA GPU with 16GB+ VRAM (recommended)
- CUDA installed

## Setup Instructions

1. **Create a Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install FASHN VTON v1.5 Core**
   The FASHN VTON model requires the official inference code. Clone it into this directory:
   ```bash
   git clone https://github.com/fashn-ai/fashn-vton-v1.5 fashn_vton
   ```

4. **Model Weights**
   The weights will be automatically downloaded from Hugging Face when you first run the server, provided you have a Hugging Face token configured or the repo is public.

5. **Run the Server**
   ```bash
   python main.py
   ```
   The server will start on `http://localhost:8000`.

## API Documentation

Once the server is running, you can access the interactive API docs at:
`http://localhost:8000/docs`

### POST /tryon

**Request Body:**
```json
{
  "human_image": "base64_string...",
  "garment_image": "base64_string...",
  "garment_type": "upper" 
}
```

**Response:**
```json
{
  "result_image": "base64_string..."
}
```

## Integration with Front-end

To use this backend instead of the default Gemini generation, update your `gemini.ts` to call this endpoint when an `API_MODE` environment variable is set to 'local'.
