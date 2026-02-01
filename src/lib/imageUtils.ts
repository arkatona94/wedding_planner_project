/**
 * Image utility functions for compression and processing
 */

/**
 * Compresses an image from a Data URL
 * @param dataUrl The source image as a Data URL
 * @param maxWidth Maximum width of the output image
 * @param maxHeight Maximum height of the output image
 * @param quality Compression quality (0.0 to 1.0)
 * @returns A promise that resolves to the compressed image as a Data URL
 */
export async function compressImage(
    dataUrl: string,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.7
): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            let width = img.width
            let height = img.height

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width)
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height)
                    height = maxHeight
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                resolve(dataUrl)
                return
            }

            ctx.drawImage(img, 0, 0, width, height)

            // Use image/jpeg for better compression
            resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = (err) => {
            console.error('Image loading failed for compression:', err)
            resolve(dataUrl)
        }
        img.src = dataUrl
    })
}

/**
 * Reads a File object and returns a compressed Data URL
 */
export async function fileToCompressedDataUrl(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.7
): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async () => {
            const dataUrl = reader.result as string
            try {
                const compressed = await compressImage(dataUrl, maxWidth, maxHeight, quality)
                resolve(compressed)
            } catch (err) {
                resolve(dataUrl)
            }
        }
        reader.onerror = () => resolve('')
        reader.readAsDataURL(file)
    })
}

/**
 * Converts a Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
}

/**
 * Converts a Data URL to a File
 */
export function dataUrlToFile(dataUrl: string, fileName: string): File {
    const blob = dataUrlToBlob(dataUrl)
    const mime = blob.type
    return new File([blob], fileName, { type: mime })
}
