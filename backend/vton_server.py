from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
import io
from PIL import Image
from inference import vton_engine

app = FastAPI(title="Wedding Planner AI Try-On Backend")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TryOnRequest(BaseModel):
    human_image: str  # Base64 string
    garment_image: str  # Base64 string
    garment_type: Optional[str] = "one-pieces"  # Default to wedding dress category


class TryOnResponse(BaseModel):
    result_image: str  # Base64 string


@app.on_event("startup")
def startup_event():
    # Pre-load the model to memory
    print("Initializing VTON model...")
    vton_engine.load_model()


@app.get("/")
def read_root():
    return {"status": "online", "model": "FASHN VTON v1.5", "target": "Wedding Dresses"}


# Standard JSON/Base64 endpoint (Easier for Web/React)
@app.post("/tryon", response_model=TryOnResponse)
async def perform_tryon_base64(request: TryOnRequest):
    try:
        # Pass base64 strings to inference engine
        result_b64 = await vton_engine.predict(
            request.human_image, request.garment_image
        )
        return TryOnResponse(result_image=result_b64)
    except Exception as e:
        print(f"Try-on failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# Multipart Form-Data endpoint (Matches directive example)
@app.post("/tryon-file")
async def perform_tryon_file(
    person_image: UploadFile = File(...), garment_image: UploadFile = File(...)
):
    try:
        # Read files
        person_data = await person_image.read()
        garment_data = await garment_image.read()

        # Convert to base64 for the internal predict method
        # (Could also be optimized to use bytes directly)
        person_b64 = base64.b64encode(person_data).decode("utf-8")
        garment_b64 = base64.b64encode(garment_data).decode("utf-8")

        result_b64 = await vton_engine.predict(person_b64, garment_b64)

        # Return as raw image bytes
        import base64

        image_bytes = base64.b64decode(result_b64)
        return Response(content=image_bytes, media_type="image/jpeg")

    except Exception as e:
        print(f"File try-on failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Get port from env or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
