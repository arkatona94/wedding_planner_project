import { Client } from "@gradio/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Perform a virtual try-on using the IDM-VTON model hosted on Hugging Face.
 * Optionally uses Gemini API (if key provided) to enhance the garment description.
 * 
 * @param personImage - The image of the person (the bride) as a Blob, File, or URL.
 * @param garmentImage - The image of the garment (the dress) as a Blob, File, or URL.
 * @param description - Detailed description of the garment.
 * @param geminiApiKey - Optional Google Gemini API key to enhance description.
 * @returns A promise that resolves to the URL of the generated image.
 */
export async function tryOnDress(
    personImage: Blob | File | string,
    garmentImage: Blob | File | string,
    description: string = "A wedding dress",
    geminiApiKey?: string
): Promise<string> {
    try {
        let enhancedDescription = description;

        // 1. If Gemini API Key is provided, use it to generate a detailed description
        if (geminiApiKey) {
            try {
                const genAI = new GoogleGenerativeAI(geminiApiKey);
                // Try gemini-1.5-flash, fallback not needed if correct key type, but harmless to try
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `Describe this wedding dress in detail for a virtual try-on model. Focus on the cut, fabric, neckline, and style. Keep it under 50 words. The dress is: ${description}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                if (text) {
                    enhancedDescription = text.trim();
                    console.log("Gemini enhanced description:", enhancedDescription);
                }
            } catch (error) {
                console.warn("Gemini description generation failed (safely ignored):", error);
                // Fallback to original description
            }
        }

        // 2. Connect to the IDM-VTON model
        // We use the IDM-VTON space which is robust for this task.
        // Note: "GoBanana" likely refers to "Nano Banana" (Gemini-based) but IDM-VTON is the standard open Try-On.
        // We stick to IDM-VTON for reliability as requested.
        const client = await Client.connect("yisol/IDM-VTON");

        // Helper: Convert input to what Gradio expects
        // If it's a URL string, we might need to fetch it to a Blob for the dict structure,
        // OR rely on handle_file if available. 
        // For IDM-VTON specifically, the 'background' expects a dict with 'path' or 'url'.
        // Let's try to just pass the URL directly if it's a string, assuming Gradio Client handles it.
        // However, if we are in Node (test), we must fetch it.

        let backgroundInput = personImage;
        let garmentInput = garmentImage;

        if (typeof personImage === 'string' && typeof window === 'undefined') {
            // In Node environment (test), fetch to Blob/Buffer
            const res = await fetch(personImage);
            const blob = await res.blob();
            backgroundInput = blob;
        }

        if (typeof garmentImage === 'string' && typeof window === 'undefined') {
            const res = await fetch(garmentImage);
            const blob = await res.blob();
            garmentInput = blob;
        }

        // Construct the expected dict for 'background' (ImageEditor)
        // Note: Gradio Client often handles raw Blobs/Files in place of dicts for ImageEditor inputs
        // by creating the dict structure internally.

        const result = await client.predict("/tryon", [
            { "background": backgroundInput, "layers": [], "composite": null },
            garmentInput,
            enhancedDescription,
            true,
            false,
            30,
            42,
        ]);

        if (Array.isArray(result) && result.length > 0) {
            const imageResult = result[0];
            // imageResult typically has 'url' property
            return (imageResult as any).url || (imageResult as any);
        } else {
            console.log("DEBUG: VTON Result Structure:", JSON.stringify(result, null, 2));
        }

        throw new Error("Unexpected result format from VTON API");
    } catch (error) {
        console.error("VTON Error:", error);
        throw error;
    }
}
