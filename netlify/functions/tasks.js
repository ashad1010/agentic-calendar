import { getStore } from '@netlify/blobs';

const STORE_NAME = 'tasks-store';
const KEY = 'tasks';

async function readTasks(store) {
  const data = await store.get(KEY, { type: 'json' });
  return data || [];
}

async function writeTasks(store, tasks) {
  await store.setJSON(KEY, tasks);
}

export default async (req) => {
  const store = getStore(STORE_NAME);

  try {
    if (req.method === 'GET') {
      const tasks = await readTasks(store);
      return new Response(JSON.stringify({ tasks }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { description, due_date } = body;

      if (!description || !due_date) {
        return new Response(
          JSON.stringify({ error: 'description and due_date are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate date format
      const parsed = new Date(due_date);
      if (isNaN(parsed.getTime())) {
        return new Response(
          JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const tasks = await readTasks(store);
      const newTask = {
        id: crypto.randomUUID(),
        description,
        due_date, // stored as YYYY-MM-DD
        created_at: new Date().toISOString(),
      };
      tasks.push(newTask);
      await writeTasks(store, tasks);

      return new Response(JSON.stringify({ task: newTask }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      const name = url.searchParams.get('name');

      let tasks = await readTasks(store);
      let removed = null;

      if (id) {
        removed = tasks.find((t) => t.id === id) || null;
        tasks = tasks.filter((t) => t.id !== id);
      } else if (name) {
        removed = tasks.find(
          (t) => t.description.toLowerCase() === name.toLowerCase()
        ) || null;
        tasks = tasks.filter(
          (t) => t.description.toLowerCase() !== name.toLowerCase()
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'id or name query param required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      await writeTasks(store, tasks);

      return new Response(JSON.stringify({ removed }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/api/tasks',
};
