import { v2 as cloudinary } from "cloudinary"

const { CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env

if (CLOUDINARY_URL) {
  cloudinary.config({ secure: true })
} else if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })
}

const DEFAULT_FOLDER = "maison-snow/products"

export async function uploadImage(
  file: Buffer,
  filename: string,
  folder: string = DEFAULT_FOLDER,
): Promise<string> {
  const baseName = filename.replace(/\.[^.]+$/, "") || "image"

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: baseName,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        if (!result?.secure_url) {
          reject(new Error("Upload succeeded but no secure URL was returned"))
          return
        }
        resolve(result.secure_url)
      },
    )

    stream.end(file)
  })
}
