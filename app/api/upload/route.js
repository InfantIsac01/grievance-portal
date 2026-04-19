import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    const uploaded = []
    
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const result = await new Promise((resolve, reject) => {
        // resource_type: "auto" works for images, videos, pdfs etc.
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'hit-portal', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })

      uploaded.push({ 
        name: file.name, 
        path: result.secure_url, 
        type: file.type, 
        size: file.size 
      })
    }
    
    return Response.json({ success: true, files: uploaded })
  } catch (e) { 
    console.error(e)
    return Response.json({ success: false, files: [] }) 
  }
}
