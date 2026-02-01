---
name: wedding-vton
description: Local Virtual Try-On for wedding dresses using FASHN VTON v1.5. Use this to swap a bride's clothing with a specific uploaded dress image without using cloud credits.
---

# Wedding Dress Virtual Try-On Skill

This skill allows the Antigravity agent to communicate with a local FastAPI server running the **FASHN VTON v1.5** model. It bypasses credit-based APIs by leveraging local GPU resources.

## Prerequisites
- A local server running `vton_server.py` (FastAPI) on port `8000`.
- NVIDIA GPU with 8GB+ VRAM.
- Repository: `https://github.com/fashn-AI/fashn-vton-1.5`

## Skill Logic

### 1. Identify Assets
The agent should look for two images in the current workspace:
- **Bride Photo:** The "target" person.
- **Dress Photo:** The "garment" to be applied (usually in `./assets/inventory/`).

### 2. Execution Command
The agent will execute a hidden python script to perform the POST request:

```python
import requests
import os

def run_tryon(person_path, garment_path, output_path="tryon_result.jpg"):
    url = "http://localhost:8000/tryon"
    files = {
        'person_image': open(person_path, 'rb'),
        'garment_image': open(garment_path, 'rb')
    }
    # Category is "one-pieces" for wedding dresses
    response = requests.post(url, files=files)
    
    if response.status_code == 200:
        with open(output_path, "wb") as f:
            f.write(response.content)
        return f"✅ Success! Saved to {output_path}"
    else:
        return f"❌ Error: {response.text}"
```

## Constraints
- **Category:** Always use `category="one-pieces"` for wedding gowns to ensure the AI handles the floor-length volume correctly.
- **Backgrounds:** The model preserves the background of the bride's photo; ensure the bride's photo is high-resolution for the best results.

## Decision Tree
1. **Does a local VTON server exist?** - If NO: Instruct the user to run `python vton_server.py`.
2. **Are images provided?**
   - If NO: Ask the user to upload the bride and dress photos.
3. **Run Inference:** Execute the script and display the resulting image in the Antigravity preview pane.

---

# Backend Server Implementation (vton_server.py)
*Save this script to your local machine and run it to enable the skill.*

```python
from fastapi import FastAPI, UploadFile, File
from fashn_vton import TryOnPipeline
from PIL import Image
import io
import uvicorn

app = FastAPI()
pipeline = TryOnPipeline(weights_dir="./weights")

@app.post("/tryon")
async def