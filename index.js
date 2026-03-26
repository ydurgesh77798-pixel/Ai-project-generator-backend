const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['https://your-netlify-app.netlify.app', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate endpoint
app.post('/generate', async (req, res) => {
    try {
        const { input, softwareType, userId } = req.body;
        
        if (!input || !softwareType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create prompt
        const prompt = `You are an AI project generator. Create a comprehensive project document for ${softwareType} based on this description: "${input}". 
        The output should be well-structured, professional, and ready to use. Include sections: Overview, Requirements, Implementation Steps, and Deliverables.`;
        
        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        res.json({
            success: true,
            result: generatedText
        });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: 'AI generation failed' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});