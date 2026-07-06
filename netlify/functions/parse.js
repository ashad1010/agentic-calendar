export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { input, mode, tasks } = await req.json();

    if (mode === 'quote') {
      const quote = await getMotivationalQuote(apiKey);
      return new Response(JSON.stringify({ quote }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!input) {
      return new Response(JSON.stringify({ error: 'input is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const taskListForPrompt = Array.isArray(tasks)
      ? tasks.map((t) => ({ id: t.id, description: t.description, due_date: t.due_date }))
      : [];

    const systemPrompt = `You are an AI assistant that helps manage tasks. Today's date is ${today}.
Convert the user's input into a structured JSON action. Respond with ONLY valid JSON, no other text.

Here is the user's CURRENT task list (use this to resolve which task they mean, especially for removal):
${JSON.stringify(taskListForPrompt)}

Formats:
- To add a task: {"action": "add_task", "description": "...", "due_date": "YYYY-MM-DD"}
- To view tasks: {"action": "view_tasks"}
- To remove a task: {"action": "remove_task", "id": "<the exact id from the task list above that best matches what the user described>"}
- If removal is requested but no task in the list clearly matches: {"action": "remove_task_not_found"}
- If you cannot understand the input: {"action": "unknown"}

When removing, always resolve to the exact "id" from the current task list above based on the closest matching description — never invent or paraphrase a description for removal.

User Input: ${input}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${errText}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const structured = JSON.parse(content);

    return new Response(JSON.stringify(structured), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function getMotivationalQuote(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'user', content: 'Give me one short motivational quote. No attribution, no quotes marks, just the line.' },
        ],
      }),
    });
    if (!response.ok) throw new Error('quote request failed');
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch {
    return "You're doing better than you think.";
  }
}

export const config = {
  path: '/api/parse',
};
