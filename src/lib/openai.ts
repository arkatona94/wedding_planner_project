// OpenAI API utilities for AI-powered features

interface TryOnResult {
  success: boolean
  imageUrl?: string
  error?: string
}

/**
 * Generate a virtual try-on image using OpenAI's DALL-E
 * This creates an AI-generated image of the person wearing the dress
 */
export async function generateDressTryOn(
  apiKey: string,
  bridePhotoUrl: string,
  dressImageUrl: string
): Promise<TryOnResult> {
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not configured' }
  }

  try {
    // First, we'll use GPT-4 Vision to analyze both images and create a detailed prompt
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a fashion AI assistant. Analyze the person's photo and the dress, then create a detailed DALL-E prompt to generate a realistic image of this person wearing this exact dress.

Focus on:
- The person's physical features (hair color, skin tone, body type)
- The dress design (style, color, fabric, details, embellishments)
- Create a prompt that will generate a beautiful bridal/fashion photo

Output ONLY the DALL-E prompt, nothing else. The prompt should be detailed but under 1000 characters.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Create a DALL-E prompt to show this person wearing this dress:'
              },
              {
                type: 'image_url',
                image_url: { url: bridePhotoUrl, detail: 'high' }
              },
              {
                type: 'image_url',
                image_url: { url: dressImageUrl, detail: 'high' }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    })

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json()
      throw new Error(error.error?.message || 'Failed to analyze images')
    }

    const analysisData = await analysisResponse.json()
    const generationPrompt = analysisData.choices[0]?.message?.content

    if (!generationPrompt) {
      throw new Error('Failed to generate image description')
    }

    // Now generate the try-on image using DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional bridal fashion photography: ${generationPrompt}. Ultra realistic, high quality, elegant lighting, magazine quality photo.`,
        n: 1,
        size: '1024x1792', // Portrait orientation for dress photos
        quality: 'hd',
        style: 'natural',
      }),
    })

    if (!imageResponse.ok) {
      const error = await imageResponse.json()
      throw new Error(error.error?.message || 'Failed to generate image')
    }

    const imageData = await imageResponse.json()
    const generatedImageUrl = imageData.data[0]?.url

    if (!generatedImageUrl) {
      throw new Error('No image was generated')
    }

    return {
      success: true,
      imageUrl: generatedImageUrl,
    }
  } catch (error) {
    console.error('Try-on generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate try-on image',
    }
  }
}

/**
 * Check if OpenAI API key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}
