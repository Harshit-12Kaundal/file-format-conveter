// import pdfParse from 'pdf-parse';

export const PdfDescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Only parse if file is present
        const data = await pdfParse(req.file.buffer);
        res.json({ text: data.text });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};