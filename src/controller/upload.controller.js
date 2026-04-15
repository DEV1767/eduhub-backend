import cloudinary from "../config/cloudinary.js";

export const uploadupiimage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            })
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error })
                }

                return res.json({
                    success: true,
                    imageUrl: result.secure_url
                })
            }
        )
        stream.end(req.file.buffer)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload failed"
        })
    }
}
