const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  const { prompt, title } = req.body;
  if (!prompt) return res.status(400).json({ script: 'No prompt provided.' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      script: `DEMO MODE — No API key configured.\n\n` +
        `LESSON: ${title}\n\n` +
        `To enable live AI script generation, add your ANTHROPIC_API_KEY to the Vercel environment variables.\n\n` +
        `Get your free API key at: console.anthropic.com\n\n` +
        `---\n\nSAMPLE SCRIPT STRUCTURE:\n\n` +
        `[0:00 — COLD OPEN]\n"Before we begin — here is a question..."\n\n` +
        `[1:00 — CORE LESSON BEAT 1]\nExplain the concept in plain English...\n\n` +
        `[3:00 — GRAPHIC]\nOn-screen: diagram showing the key relationship...\n\n` +
        `[5:00 — BUSINESS EXAMPLE]\n"Here is how this shows up in a real company..."\n\n` +
        `[7:30 — CODE DEMO]\nOpen Jupyter, walk through the implementation...\n\n` +
        `[9:00 — CLOSE + CTA]\n"Subscribe, comment below, and see you next video."`
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are Prof. ML — a senior MIT lecturer with a PhD in Machine Learning and AI, creator of ML Business Lab on YouTube. You write production scripts for business professionals who are complete beginners. Your scripts are warm, authoritative, jargon-free. Structure: (1) Cold open hook 30s, (2) Core lesson 3-4 beats with dialogue samples, (3) Key on-screen graphic description, (4) Business example, (5) Close + CTA. Use [stage directions] in brackets and timing labels like (2:30).`,
        messages: [{
          role: 'user',
          content: `Write a structured YouTube production script outline for ML Business Lab lesson: "${title}"\n\nContext: ${prompt}\n\nInclude: compelling hook, 4 timed teaching beats with sample spoken dialogue, one key graphic spec, one concrete business example, strong close with CTA. Target 8-10 minutes.`
        }]
      })
    });

    const data = await response.json();
    const script = data.content?.[0]?.text || 'Script generation failed. Please try again.';
    return res.json({ script });
  } catch (err) {
    return res.status(500).json({ script: `Error: ${err.message}` });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ML Business Lab running on port ${PORT}`));
