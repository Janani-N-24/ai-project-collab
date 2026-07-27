const axios = require('axios');

// System prompt strictly constrains the model to ONLY produce task-breakdown JSON.
// This is the one and only AI capability in the app — no chat, no summarization, no code generation.
const SYSTEM_PROMPT = `You are a project task breakdown assistant for a software engineering team.
Given a short project description, break it down into 5 to 10 concrete, actionable development tasks.

Respond with ONLY a raw JSON array. No markdown, no code fences, no explanation, no extra text.
Each array element must be an object with exactly these fields:
- "title": short task name (string, max 100 characters)
- "description": one or two sentences describing the task (string, max 400 characters)
- "priority": one of "Low", "Medium", or "High" (string)

Example output:
[
  {"title": "Design Database Schema", "description": "Create MongoDB schemas for users, orders, and products.", "priority": "High"},
  {"title": "Implement Authentication", "description": "Add JWT-based login and registration.", "priority": "High"}
]`;

// Parses and strictly validates the model's raw text response into a clean task array.
// Throws a descriptive error if the model didn't return valid, well-shaped JSON —
// callers are expected to catch this and respond gracefully rather than crash.
const parseAndValidateTasks = (rawText) => {
  let cleaned = rawText.trim();

  // Some models wrap JSON in ```json fences despite instructions — strip defensively
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('AI response was not valid JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response was not a JSON array');
  }
  if (parsed.length === 0) {
    throw new Error('AI returned no tasks');
  }

  const validPriorities = ['Low', 'Medium', 'High'];

  return parsed.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Task at index ${index} is not a valid object`);
    }
    const { title, description, priority } = item;
    if (typeof title !== 'string' || !title.trim()) {
      throw new Error(`Task at index ${index} is missing a valid title`);
    }
    return {
      title: title.trim().slice(0, 150),
      description: typeof description === 'string' ? description.trim().slice(0, 3000) : '',
      priority: validPriorities.includes(priority) ? priority : 'Medium',
    };
  });
};

// Calls the configured LLM API and returns a validated array of { title, description, priority }.
// Throws on any failure (network, auth, malformed response) — the controller decides how to
// surface that to the user and log it.
const generateTasksFromDescription = async (projectDescription) => {
  if (!process.env.AI_API_KEY || !process.env.AI_API_URL) {
    throw new Error('AI service is not configured (missing AI_API_KEY / AI_API_URL)');
  }

  const response = await axios.post(
    process.env.AI_API_URL,
    {
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Project description: ${projectDescription}` },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const rawText = response.data?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('AI API returned an unexpected response shape');
  }

  const tasks = parseAndValidateTasks(rawText);
  return { tasks, rawText };
};

module.exports = { generateTasksFromDescription };
