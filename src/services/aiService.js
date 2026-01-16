// Google Gemini API Integration
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ REPLACE WITH YOUR ACTUAL API KEY
const API_KEY = "AIzaSyCwDc9_b10ndEPVNeB4yS8JDdX4ZtFYPv0";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are a friendly and helpful AI assistant for a college canteen called "PrePlate".
Your goal is to help students with their food orders.
- Be concise and answer in 1-2 sentences.
- Use emojis to be engaging.
- If asked about the menu, mention Biriyani, Fried Rice, and Snacks.
- If asked about wait time, say it depends on the crowd but usually 5-10 mins.
- If asked unrelated questions, professionally guide them back to food topics.`;

export const getChatResponse = async (userMessage) => {
    try {
        // If no API key is set, fall back to mock logic (Safety Check)
        if (API_KEY === "YOUR_GEMINI_API_KEY") {
            return getMockResponse(userMessage);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                {
                    role: "model",
                    parts: [{ text: "Got it! I am ready to help students with PrePlate canteen queries." }],
                },
            ],
        });

        const result = await chat.sendMessage(userMessage);
        return result.response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        return `I'm having a bit of trouble connecting to the kitchen right now. 🍳 Error: ${error.message}`;
    }
};

const getMockResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    if (msg.includes("special")) return "Today's special is the Hyderabadi Chicken Biriyani! 🍗 It's selling fast!";
    if (msg.includes("veg")) return "For vegetarians, we have Paneer Butter Masala and Veg Fried Rice today. 🥦";
    if (msg.includes("wait") || msg.includes("rush")) return "Current wait time is roughly 5 minutes. 12:45 slot is quite empty! 🕒";
    return "I'm your PrePlate AI! Ask me about the menu, wait times, or specials. (Set API Key for real AI) 🤖";
};

export const generateMenuSuggestions = async (weather, pastSales) => {
    // Mock response for the hackathon "happy path"
    return [
        { name: "Hot Corn Soup", reason: "It's rainy today!" },
        { name: "Spicy Noodles", reason: "Popular choice for cold weather" }
    ];
};
