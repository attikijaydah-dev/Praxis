const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.'));

// Connexion sécurisée à OpenAI via ta clé d'environnement
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ROUTE 1 : Extraction préalable des concepts du cours
app.post('/api/extract-concepts', async (req, res) => {
  try {
    const { course } = req.body;
    const prompt = `Tu es un professeur de PASS/PONT. Lis ce cours et extrait la liste de toutes les notions/concepts anatomiques, biologiques ou pharmacologiques essentiels.
    
Cours : "${course.substring(0, 5000)}"

Réponds STRICTEMENT au format JSON :
{
  "concepts": ["Concept 1", "Concept 2", "Concept 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'extraction" });
  }
});

// ROUTE 2 : Génération de QCM par notion
app.post('/api/generate-qcm', async (req, res) => {
  try {
    const { course, concepts, previousTopics } = req.body;
    const prompt = `Tu es un professeur de PASS.
À partir de ce cours : "${course.substring(0, 4000)}"
Et de cette liste de concepts : ${JSON.stringify(concepts)}

Génère 1 QCM sur UNE NOTION qui n'a pas encore été abordée récemment dans cette liste : ${JSON.stringify(previousTopics)}.

Format JSON strict :
{
  "topic": "Nom du concept traité",
  "question": "Libellé du QCM",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanations": ["Exp A", "Exp B", "Exp C", "Exp D"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération du QCM" });
  }
});

// ROUTE 3 : Génération Flashcards basée sur la densité
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { course, concepts } = req.body;
    const prompt = `Tu es un professeur de PASS.
Génère entre 10 et 20 flashcards couvrant l'ensemble de ces notions : ${JSON.stringify(concepts)}.
Cours de référence : "${course.substring(0, 4000)}"

Format JSON strict :
[
  { "q": "Question", "r": "Réponse courte et précise" }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération des flashcards" });
  }
});

// ROUTE 4 : Synthèse d'erreurs
app.post('/api/analyze-mistakes', async (req, res) => {
  try {
    const { mistakes } = req.body;
    const prompt = `Analyse ces confusions en PASS : ${JSON.stringify(mistakes)}. Donne 2 astuces de mémorisation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'analyse" });
  }
});

// Lancement du serveur sur le port attribué par Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Praxis prêt sur le port ${PORT}`));
