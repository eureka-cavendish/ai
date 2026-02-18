const API_KEY = "AIzaSyDAI8aMpyttkQXq_y1U_lB7oCV5JPUun8Q";
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const INSTRUCTION_URL = 'https://raw.githubusercontent.com/eureka-cavendish/ai/main/knowledge.json';
const STORAGE_KEY = 'chat_history_ce';

let instructionData = { systemInstruction: '', customKnowledge: '' };
const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Initialize App
async function init() {
    try {
        const response = await fetch(INSTRUCTION_URL);
        const data = await response.json();
        instructionData.systemInstruction = data.system_instruction;
        instructionData.customKnowledge = data.custom_knowledge;
    } catch (e) {
        console.error("Failed to load instructions", e);
        instructionData.systemInstruction = "You are a friendly chatbot.";
    }
    
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('chat-app').classList.remove('hidden');
    loadHistory();
}

function appendMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    msgDiv.textContent = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function getGeminiResponse(prompt) {
    const fullPrompt = `${instructionData.customKnowledge} \n\n--- User Query: ${prompt}`;
    
    const payload = {
        contents: [{ parts: [{ text: fullPrompt }] }],
        systemInstruction: { parts: [{ text: instructionData.systemInstruction }] }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No response.";
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    userInput.value = '';
    saveHistory();

    document.getElementById('loading-indicator').classList.remove('hidden');

    try {
        const aiResponse = await getGeminiResponse(text);
        appendMessage(aiResponse, false);
        saveHistory();
    } catch (err) {
        appendMessage("Error: Failed to connect to AI.", false);
    } finally {
        document.getElementById('loading-indicator').classList.add('hidden');
    }
});

function saveHistory() {
    const messages = Array.from(chatContainer.children).map(div => ({
        text: div.textContent,
        isUser: div.classList.contains('user-message')
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.forEach(m => appendMessage(m.text, m.isUser));
}


init();



