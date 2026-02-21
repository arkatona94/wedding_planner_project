import OpenAI from 'openai';

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generate a virtual try-on image using OpenAI (ChatGPT/DALL-E)
 * This uses GPT-4o with Vision to analyze the images and then DALL-E 3 to generate the merge.
 */
export async function generateDressTryOnChatGPT(
  apiKey: string,
  bridePhotoUrl: string,
  dressImageUrl: string
): Promise<TryOnResult> {
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Essential for client-side usage
  });

  try {
    console.log('Analyzing images with ChatGPT (Vision)...');

    // 1. Analyze both images using GPT-4o
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze these two images. Image 1 is a bride. Image 2 is a wedding dress. " +
                "Create a detailed DALL-E 3 prompt to show THIS EXACT bride wearing THIS EXACT dress. " +
                "Describe the bride's facial features, hair, and skin tone specifically to maintain her likeness. " +
                "Describe the dress's cut, fabric, and details accurately. " +
                "The output should be a single prompt for DALL-E 3 that results in a professional fashion photo."
            },
            {
              type: "image_url",
              image_url: { url: bridePhotoUrl }
            },
            {
              type: "image_url",
              image_url: { url: dressImageUrl }
            }
          ],
        },
      ],
      max_tokens: 300,
    });

    const generationPrompt = analysisResponse.choices[0]?.message?.content;

    if (!generationPrompt) {
      throw new Error('ChatGPT failed to generate an analysis of the images.');
    }

    console.log('Generated ChatGPT Prompt:', generationPrompt);
    console.log('Generating merge with DALL-E 3...');

    // 2. Generate the image using DALL-E 3
    const generationResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A high-resolution professional fashion photography shot: ${generationPrompt}`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = generationResponse.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('DALL-E 3 failed to generate the image.');
    }

    return {
      success: true,
      imageUrl: imageUrl
    };

  } catch (error: any) {
    console.error('ChatGPT Try-on error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during the ChatGPT merge process.'
    };
  }
}
