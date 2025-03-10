const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({
    origin: "*", // Change this to your frontend domain in production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the AI Code Reviewer API with Gemini AI!" });
});

app.post("/analyze", async (req, res) => {
    const { code } = req.body;

    if (!code || code.trim() === "") {
        return res.status(400).json({ error: "Code cannot be empty." });
    }

    try {
        const aiResponse = await getAISuggestions(code);
        res.json({ analysis: aiResponse });
    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).json({ error: "AI analysis failed." });
    }
});

async function getAISuggestions(code) {
    const prompt = `
    Analyze the following Python code and provide feedback:
    
    Code:
    ${code}
    
    - Identify syntax errors
    - Suggest improvements
    - Optimize performance
    - Provide a corrected version if needed
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const response = await model.generateContent(prompt);
    return response.response.text();
}
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
