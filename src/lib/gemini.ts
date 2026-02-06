// Google Gemini API utilities for AI-powered features

interface TryOnResult {
  success: boolean
  imageUrl?: string
  error?: string
}

// Helper to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

import { compressImage as compressImg } from './imageUtils'

// Helper to compress an image to reduce token usage
async function compressImage(base64: string, mimeType: string, maxSize: number = 800): Promise<{ base64: string; mimeType: string }> {
  try {
    const dataUrl = await compressImg(`data:${mimeType};base64,${base64}`, maxSize, maxSize, 0.7)
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (matches) {
      return {
        mimeType: matches[1],
        base64: matches[2]
      }
    }
  } catch (err) {
    console.error('Compression failed in gemini lib:', err)
  }
  return { base64, mimeType }
}

/**
 * Generate a virtual try-on image using Google's Gemini
 * This creates an AI-generated image of the person wearing the dress
 */
export async function generateDressTryOn(
  apiKey: string,
  bridePhotoUrl: string,
  dressImageUrl: string,
  vtonApiUrl?: string,
  retryCount: number = 0
): Promise<TryOnResult> {
  // If local VTON API is provided, use it instead of Gemini
  if (vtonApiUrl) {
    return await generateWithLocalVton(vtonApiUrl, bridePhotoUrl, dressImageUrl)
  }

  if (!apiKey) {
    return { success: false, error: 'Gemini API key not configured' }
  }

  const MAX_RETRIES = 2

  try {
    // Convert image URLs to base64 if they're data URLs, otherwise fetch them
    console.log('Loading bride photo...')
    const brideImageData = await getImageData(bridePhotoUrl, 'bride photo')

    if (!brideImageData) {
      return { success: false, error: 'Failed to load your photo from Settings. Please re-upload your photo.' }
    }

    console.log('Loading dress image...')
    const dressImageData = await getImageData(dressImageUrl, 'dress image')

    if (!dressImageData) {
      return {
        success: false,
        error: 'Failed to load the dress image. If this image is from an external website, try saving it to your device first and then uploading it to the inspiration board.'
      }
    }

    // Compress images to reduce token usage (helps with rate limits)
    console.log('Compressing images to reduce API usage...')
    const compressedBride = await compressImage(brideImageData.base64, brideImageData.mimeType, 600)
    const compressedDress = await compressImage(dressImageData.base64, dressImageData.mimeType, 600)

    console.log('Analyzing images with Gemini...')

    // Use gemini-1.5-flash which has better free tier limits
    const analysisResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze these two images and create a short DALL-E style prompt (under 200 chars) to show this person wearing this dress. Focus on: hair color, skin tone, dress style/color. Output ONLY the prompt.`
                },
                {
                  inlineData: {
                    mimeType: compressedBride.mimeType,
                    data: compressedBride.base64
                  }
                },
                {
                  inlineData: {
                    mimeType: compressedDress.mimeType,
                    data: compressedDress.base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          }
        }),
      }
    )

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json()
      const errorMessage = error.error?.message || 'Failed to analyze images'
      console.error('Gemini analysis error:', errorMessage)

      // Check if it's a rate limit error
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || error.error?.code === 429) {
        // Extract wait time if available
        const waitMatch = errorMessage.match(/retry in (\d+(?:\.\d+)?)/i)
        const waitTime = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) + 2 : 30

        if (retryCount < MAX_RETRIES) {
          console.log(`Rate limited. Waiting ${waitTime}s before retry ${retryCount + 1}/${MAX_RETRIES}...`)
          await sleep(waitTime * 1000)
          return generateDressTryOn(apiKey, bridePhotoUrl, dressImageUrl, vtonApiUrl, retryCount + 1)
        }

        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitTime} seconds and try again, or upgrade your Gemini API plan at ai.google.dev for higher limits.`
        }
      }

      throw new Error(errorMessage)
    }

    const analysisData = await analysisResponse.json()
    const generationPrompt = analysisData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generationPrompt) {
      throw new Error('Failed to generate image description from analysis')
    }

    console.log('Generated prompt:', generationPrompt)
    console.log('Generating try-on image...')

    // Try Gemini 2.0 Flash with image generation
    return await generateWithGeminiFlash(apiKey, generationPrompt, retryCount)

  } catch (error) {
    console.error('Try-on generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate try-on image'

    // Check for rate limit in catch block too
    if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Rate limited. Waiting 30s before retry...`)
        await sleep(30000)
        return generateDressTryOn(apiKey, bridePhotoUrl, dressImageUrl, vtonApiUrl, retryCount + 1)
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Generate image using Gemini 2.0 Flash with native image generation
 */
async function generateWithGeminiFlash(
  apiKey: string,
  prompt: string,
  retryCount: number = 0
): Promise<TryOnResult> {
  const MAX_RETRIES = 2

  try {
    console.log('Trying Gemini Flash image generation...')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a fashion photo: ${prompt}. Realistic, elegant lighting, portrait.`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      const errorMessage = error.error?.message || 'Failed to generate image'
      console.error('Gemini Flash error:', errorMessage)

      // Check for rate limit
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || error.error?.code === 429) {
        const waitMatch = errorMessage.match(/retry in (\d+(?:\.\d+)?)/i)
        const waitTime = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) + 2 : 30

        if (retryCount < MAX_RETRIES) {
          console.log(`Rate limited. Waiting ${waitTime}s before retry...`)
          await sleep(waitTime * 1000)
          return generateWithGeminiFlash(apiKey, prompt, retryCount + 1)
        }

        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitTime} seconds and try again. Free tier has limited requests per minute.`
        }
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    // Look for image in the response parts
    const parts = data.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return {
          success: true,
          imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        }
      }
    }

    throw new Error('No image was generated. The AI may not be able to generate this type of image.')
  } catch (error) {
    console.error('Gemini Flash generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image',
    }
  }
}

/**
 * Generate virtual try-on using a local FastAPI server (FASHN VTON v1.5)
 */
async function generateWithLocalVton(
  apiUrl: string,
  bridePhotoUrl: string,
  dressImageUrl: string
): Promise<TryOnResult> {
  try {
    console.log('Using local VTON server at:', apiUrl)

    const brideImageData = await getImageData(bridePhotoUrl, 'bride photo')
    const dressImageData = await getImageData(dressImageUrl, 'dress image')

    if (!brideImageData || !dressImageData) {
      throw new Error('Failed to load images for VTON')
    }

    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/tryon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        human_image: brideImageData.base64,
        garment_image: dressImageData.base64,
        garment_type: 'one-pieces'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Local VTON error: ${errorText}`)
    }

    const data = await response.json()
    return {
      success: true,
      imageUrl: `data:image/jpeg;base64,${data.result_image}`,
    }
  } catch (error) {
    console.error('Local VTON generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to local VTON server',
    }
  }
}

/**
 * Generate virtual try-on using Replicate's IDM-VTON model
 * Free tier available - ~$0.023 per run, best-in-class quality
 * Get API token from: https://replicate.com/account/api-tokens
 */
export async function generateWithReplicateVton(
  replicateApiToken: string,
  bridePhotoUrl: string,
  dressImageUrl: string
): Promise<TryOnResult> {
  try {
    console.log('Using Replicate IDM-VTON (free tier)...')

    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
        input: {
          human_img: bridePhotoUrl,
          garm_img: dressImageUrl,
          garment_des: 'elegant wedding dress',
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42
        }
      }),
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(error.detail || 'Failed to create prediction')
    }

    const prediction = await createResponse.json()
    console.log('Prediction created:', prediction.id)

    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await sleep(2000)
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { 'Authorization': `Bearer ${replicateApiToken}` } }
      )
      result = await statusResponse.json()
      console.log('VTON status:', result.status)
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Prediction failed')
    }

    const outputUrl = result.output
    if (!outputUrl) {
      throw new Error('No output image returned')
    }

    return { success: true, imageUrl: outputUrl }
  } catch (error) {
    console.error('Replicate VTON error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate with Replicate',
    }
  }
}

/**
 * Helper to get image data (base64 and mime type) from a URL or data URL
 */
async function getImageData(url: string, imageType: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    // If it's already a data URL, extract the base64 and mime type
    if (url.startsWith('data:')) {
      const matches = url.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        console.log(`${imageType}: Successfully extracted data URL (${matches[1]})`)
        return {
          mimeType: matches[1],
          base64: matches[2]
        }
      }
      console.error(`${imageType}: Invalid data URL format`)
      return null
    }

    // For remote URLs, try to fetch with CORS
    console.log(`${imageType}: Fetching from URL...`)

    // Try direct fetch first
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      })

      if (response.ok) {
        const blob = await response.blob()
        const base64 = await blobToBase64(blob)
        console.log(`${imageType}: Successfully fetched (${blob.type})`)
        return {
          mimeType: blob.type || 'image/jpeg',
          base64
        }
      }
    } catch (corsError) {
      console.log(`${imageType}: Direct fetch failed (likely CORS), trying canvas...`)
    }

    // If CORS fails, try using an image element to load it
    try {
      const imageData = await loadImageViaCanvas(url)
      if (imageData) {
        console.log(`${imageType}: Successfully loaded via canvas`)
        return imageData
      }
    } catch (canvasError) {
      console.log(`${imageType}: Canvas method failed:`, canvasError)
    }

    console.error(`${imageType}: All methods failed`)
    return null
  } catch (error) {
    console.error(`Failed to get ${imageType} data:`, error)
    return null
  }
}

/**
 * Load image via canvas (works for some CORS-blocked images)
 */
function loadImageViaCanvas(url: string): Promise<{ base64: string; mimeType: string } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const timeout = setTimeout(() => {
      resolve(null)
    }, 10000)

    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          resolve({
            mimeType: matches[1],
            base64: matches[2]
          })
        } else {
          resolve(null)
        }
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Convert a Blob to base64 string (without the data URL prefix)
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Check if Gemini API key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    return response.ok
  } catch {
    return false
  }
}
