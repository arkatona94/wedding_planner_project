import torch
import os
import base64
from io import BytesIO
from PIL import Image
from diffusers import AutoencoderKL, UNet2DConditionModel, PNDMScheduler
from transformers import CLIPTextModel, CLIPTokenizer, CLIPVisionModelWithProjection

# Note: In a real environment, you would clone the fashn-vton-v1.5 repo
# and use their specific pipeline. We will provide a clean structure here.


class VTONInference:
    def __init__(self, model_id="fashn-ai/vton-v1.5"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = model_id
        self.pipeline = None

    def load_model(self):
        """
        Loads the FASHN VTON v1.5 model.
        Expects weights in the './weights' directory as per directive.
        """
        print(f"Loading FASHN VTON v1.5 on {self.device}...")

        try:
            from fashn_vton import TryOnPipeline

            self.pipeline = TryOnPipeline(weights_dir="./weights")
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Note: Ensure fashn_vton is installed and weights are in ./weights")

    def image_to_base64(self, image: Image.Image) -> str:
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def base64_to_image(self, base64_str: str) -> Image.Image:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        image_data = base64.b64decode(base64_str)
        return Image.open(BytesIO(image_data))

    async def predict(self, human_img_b64: str, garment_img_b64: str) -> str:
        """
        Performs the virtual try-on.
        Always uses category="one-pieces" for wedding gowns per directive.
        """
        # Load images
        human_img = self.base64_to_image(human_img_b64).convert("RGB")
        garment_img = self.base64_to_image(garment_img_b64).convert("RGB")

        if self.pipeline:
            # Perform inference
            # Category="one-pieces" is critical for wedding dresses
            result = self.pipeline(
                human_img=human_img, garment_img=garment_img, category="one-pieces"
            )
        else:
            print("Warning: Pipeline not loaded. Returning original.")
            result = human_img

        return self.image_to_base64(result)


# Singleton instance
vton_engine = VTONInference()
