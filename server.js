// server.js - Backend for Drone Mission Storyboard Agent
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // ✅ Serve static files from /public

// Handle POST requests for storyboards
app.post('/api/storyboard', async (req, res) => {
  const { location, projectType, outputType, toneStyle } = req.body;

  const prompt = `You are a professional drone mission planning assistant for a commercial drone operator. Based on the following inputs, generate a complete visual storyboard and shoot plan:\n\nLocation: ${location}\nProject Type: ${projectType}\nOutput Type: ${outputType}\nTone/Style: ${toneStyle}\n\nYour output should include:\n- A structured storyboard flow (opening, subject, transition, closing)\n- Recommended shot types (aerial and ground, photo and video)\n- Key points of interest or locations to feature\n- Suggested narrative tone or storyline\n- Deliverable outline (photo quantity, video duration, delivery format)\n\nMake the output professional, detailed, and field-usable.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a drone operations planning assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

   const data = await response.json();
console.log('OpenAI raw response:', JSON.stringify(data, null, 2));

const message = data.choices?.[0]?.message?.content || "⚠️ GPT response failed or came back empty.";
res.json({ storyboard: message });

  } catch (err) {
    console.error('Error generating storyboard:', err);
    res.status(500).json({ error: 'Failed to generate storyboard' });
  }
});

// ✅ Serve storyindex.html at root path
app.get('/', (req, res) => {
  res.sendFile('storyindex.html', { root: 'public' });
});

// Start the server
app.listen(PORT, () => console.log(`Storyboard server running on port ${PORT}`));
