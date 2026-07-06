import { useState, useEffect, useCallback } from 'react';
import './index.css';

function daysUntil(dueDateStr) {
  const now = new Date();
  const due = new Date(dueDateStr + 'T23:59:59');
  const diffMs = due.setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function dueMeta(dueDateStr) {
  const days = daysUntil(dueDateStr);
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, cls: 'overdue-text', overdue: true };
  if (days === 0) return { label: 'Due today', cls: 'today-text', overdue: false };
  if (days === 1) return { label: 'Due tomorrow', cls: '', overdue: false };
  return { label: `Due ${dueDateStr}`, cls: '', overdue: false };
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [nlInput, setNlInput] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [quote, setQuote] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      setStatus({ type: 'error', text: "Couldn't load tasks. Check your connection." });
    }
  }, []);

  useEffect(() => {
    loadTasks();
    fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'quote' }),
    })
      .then((r) => r.json())
      .then((d) => setQuote(d.quote))
      .catch(() => setQuote("You're doing better than you think."));
  }, [loadTasks]);

  async function addTask(description, due_date) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, due_date }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add task');
    }
    const data = await res.json();
    // Update UI immediately from the response instead of re-fetching,
    // since Blobs reads can lag slightly right after a write.
    setTasks((prev) => [...prev, data.task]);
  }

  async function removeTaskById(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async function handleManualAdd(e) {
    e.preventDefault();
    if (!manualDesc.trim() || !manualDate) {
      setStatus({ type: 'error', text: 'Enter a description and due date.' });
      return;
    }
    try {
      await addTask(manualDesc.trim(), manualDate);
      setManualDesc('');
      setManualDate('');
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  }

  async function handleNlSubmit(e) {
    e.preventDefault();
    if (!nlInput.trim() || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: nlInput.trim(), tasks }),
      });
      const structured = await res.json();

      if (structured.action === 'add_task') {
        await addTask(structured.description, structured.due_date);
        setStatus({ type: 'info', text: `Added: "${structured.description}" — due ${structured.due_date}` });
      } else if (structured.action === 'remove_task') {
        const match = tasks.find((t) => t.id === structured.id);
        await removeTaskById(structured.id);
        setStatus({
          type: 'info',
          text: match ? `Removed "${match.description}"` : 'Task removed.',
        });
      } else if (structured.action === 'remove_task_not_found') {
        setStatus({ type: 'error', text: "Couldn't find a matching task to remove. Check the exact wording in your list." });
      } else if (structured.action === 'view_tasks') {
        await loadTasks();
        setStatus({ type: 'info', text: 'Task list refreshed below.' });
      } else {
        setStatus({ type: 'error', text: "Couldn't interpret that. Try rephrasing, or use the manual form below." });
      }
      setNlInput('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...tasks].sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div className="page-shell">
    <div className="app">
      <div className="header">
        <p className="eyebrow">Agentic Productivity Assistant</p>
        <h1>Welcome back, Ashad.</h1>
        <p className="subtitle">Type naturally, or add a task manually below.</p>
        {quote && (
          <div className="quote-banner">
            <span className="label">TODAY</span>{quote}
          </div>
        )}
      </div>

      {status && (
        <div className={`status-line ${status.type}`}>{status.text}</div>
      )}

      <div className="input-panel">
        <form className="input-row" onSubmit={handleNlSubmit}>
          <input
            type="text"
            placeholder='Try: "Remind me to file taxes on 2026-07-15"'
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            disabled={busy}
          />
          <button className="send-btn" type="submit" disabled={busy}>
            {busy ? 'Thinking…' : 'Send'}
          </button>
        </form>
        <p className="hint">Natural language, parsed by GPT-4o — add, view, or remove tasks in plain English.</p>

        <div className="divider-row">
          <div className="line" />
          <span>Or add manually</span>
          <div className="line" />
        </div>

        <form className="manual-add" onSubmit={handleManualAdd}>
          <input
            type="text"
            placeholder="Task description"
            value={manualDesc}
            onChange={(e) => setManualDesc(e.target.value)}
          />
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
          />
          <button className="send-btn" type="submit">Add</button>
        </form>
      </div>

      <p className="section-label">Your tasks ({sorted.length})</p>

      {sorted.length === 0 ? (
        <div className="empty-state">No tasks yet — add one above to get started.</div>
      ) : (
        <div className="task-list">
          {sorted.map((task) => {
            const meta = dueMeta(task.due_date);
            return (
              <div className={`task-card ${meta.overdue ? 'overdue' : ''}`} key={task.id}>
                <div className="task-main">
                  <p className="task-desc">{task.description}</p>
                  <p className={`task-due ${meta.cls}`}>{meta.label}</p>
                </div>
                <button className="remove-btn" onClick={() => removeTaskById(task.id)} aria-label={`Remove ${task.description}`}>
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="footer-note">
        Rebuilt from the original CLI tool. Storage: Netlify Blobs. AI parsing: OpenAI GPT-4o.
        <br />
        Planned next: Google Calendar sync (requires OAuth setup, not yet wired up).
      </div>
      </div>
    </div>
  );
}