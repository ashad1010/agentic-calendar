
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/parse.js
var parse_default = async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server missing OPENAI_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const { input, mode, tasks } = await req.json();
    if (mode === "quote") {
      const quote = await getMotivationalQuote(apiKey);
      return new Response(JSON.stringify({ quote }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!input) {
      return new Response(JSON.stringify({ error: "input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const taskListForPrompt = Array.isArray(tasks) ? tasks.map((t) => ({ id: t.id, description: t.description, due_date: t.due_date })) : [];
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

When removing, always resolve to the exact "id" from the current task list above based on the closest matching description \u2014 never invent or paraphrase a description for removal.

User Input: ${input}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-2024-08-06",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${errText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    const structured = JSON.parse(content);
    return new Response(JSON.stringify(structured), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
async function getMotivationalQuote(apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "user", content: "Give me one short motivational quote. No attribution, no quotes marks, just the line." }
        ]
      })
    });
    if (!response.ok) throw new Error("quote request failed");
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch {
    return "You're doing better than you think.";
  }
}
var config = {
  path: "/api/parse"
};
export {
  config,
  parse_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvcGFyc2UuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEpID0+IHtcbiAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSksIHtcbiAgICAgIHN0YXR1czogNDA1LFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWTtcbiAgaWYgKCFhcGlLZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1NlcnZlciBtaXNzaW5nIE9QRU5BSV9BUElfS0VZJyB9KSxcbiAgICAgIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH1cbiAgICApO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB7IGlucHV0LCBtb2RlLCB0YXNrcyB9ID0gYXdhaXQgcmVxLmpzb24oKTtcblxuICAgIGlmIChtb2RlID09PSAncXVvdGUnKSB7XG4gICAgICBjb25zdCBxdW90ZSA9IGF3YWl0IGdldE1vdGl2YXRpb25hbFF1b3RlKGFwaUtleSk7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgcXVvdGUgfSksIHtcbiAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnaW5wdXQgaXMgcmVxdWlyZWQnIH0pLCB7XG4gICAgICAgIHN0YXR1czogNDAwLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgY29uc3QgdGFza0xpc3RGb3JQcm9tcHQgPSBBcnJheS5pc0FycmF5KHRhc2tzKVxuICAgICAgPyB0YXNrcy5tYXAoKHQpID0+ICh7IGlkOiB0LmlkLCBkZXNjcmlwdGlvbjogdC5kZXNjcmlwdGlvbiwgZHVlX2RhdGU6IHQuZHVlX2RhdGUgfSkpXG4gICAgICA6IFtdO1xuXG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gYFlvdSBhcmUgYW4gQUkgYXNzaXN0YW50IHRoYXQgaGVscHMgbWFuYWdlIHRhc2tzLiBUb2RheSdzIGRhdGUgaXMgJHt0b2RheX0uXG5Db252ZXJ0IHRoZSB1c2VyJ3MgaW5wdXQgaW50byBhIHN0cnVjdHVyZWQgSlNPTiBhY3Rpb24uIFJlc3BvbmQgd2l0aCBPTkxZIHZhbGlkIEpTT04sIG5vIG90aGVyIHRleHQuXG5cbkhlcmUgaXMgdGhlIHVzZXIncyBDVVJSRU5UIHRhc2sgbGlzdCAodXNlIHRoaXMgdG8gcmVzb2x2ZSB3aGljaCB0YXNrIHRoZXkgbWVhbiwgZXNwZWNpYWxseSBmb3IgcmVtb3ZhbCk6XG4ke0pTT04uc3RyaW5naWZ5KHRhc2tMaXN0Rm9yUHJvbXB0KX1cblxuRm9ybWF0czpcbi0gVG8gYWRkIGEgdGFzazoge1wiYWN0aW9uXCI6IFwiYWRkX3Rhc2tcIiwgXCJkZXNjcmlwdGlvblwiOiBcIi4uLlwiLCBcImR1ZV9kYXRlXCI6IFwiWVlZWS1NTS1ERFwifVxuLSBUbyB2aWV3IHRhc2tzOiB7XCJhY3Rpb25cIjogXCJ2aWV3X3Rhc2tzXCJ9XG4tIFRvIHJlbW92ZSBhIHRhc2s6IHtcImFjdGlvblwiOiBcInJlbW92ZV90YXNrXCIsIFwiaWRcIjogXCI8dGhlIGV4YWN0IGlkIGZyb20gdGhlIHRhc2sgbGlzdCBhYm92ZSB0aGF0IGJlc3QgbWF0Y2hlcyB3aGF0IHRoZSB1c2VyIGRlc2NyaWJlZD5cIn1cbi0gSWYgcmVtb3ZhbCBpcyByZXF1ZXN0ZWQgYnV0IG5vIHRhc2sgaW4gdGhlIGxpc3QgY2xlYXJseSBtYXRjaGVzOiB7XCJhY3Rpb25cIjogXCJyZW1vdmVfdGFza19ub3RfZm91bmRcIn1cbi0gSWYgeW91IGNhbm5vdCB1bmRlcnN0YW5kIHRoZSBpbnB1dDoge1wiYWN0aW9uXCI6IFwidW5rbm93blwifVxuXG5XaGVuIHJlbW92aW5nLCBhbHdheXMgcmVzb2x2ZSB0byB0aGUgZXhhY3QgXCJpZFwiIGZyb20gdGhlIGN1cnJlbnQgdGFzayBsaXN0IGFib3ZlIGJhc2VkIG9uIHRoZSBjbG9zZXN0IG1hdGNoaW5nIGRlc2NyaXB0aW9uIFx1MjAxNCBuZXZlciBpbnZlbnQgb3IgcGFyYXBocmFzZSBhIGRlc2NyaXB0aW9uIGZvciByZW1vdmFsLlxuXG5Vc2VyIElucHV0OiAke2lucHV0fWA7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbW9kZWw6ICdncHQtNG8tMjAyNC0wOC0wNicsXG4gICAgICAgIG1lc3NhZ2VzOiBbeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtUHJvbXB0IH1dLFxuICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogJ2pzb25fb2JqZWN0JyB9LFxuICAgICAgfSksXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zdCBlcnJUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogYE9wZW5BSSBlcnJvcjogJHtlcnJUZXh0fWAgfSksXG4gICAgICAgIHsgc3RhdHVzOiA1MDIsIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBjb25zdCBjb250ZW50ID0gZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudDtcbiAgICBjb25zdCBzdHJ1Y3R1cmVkID0gSlNPTi5wYXJzZShjb250ZW50KTtcblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoc3RydWN0dXJlZCksIHtcbiAgICAgIHN0YXR1czogMjAwLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSksIHtcbiAgICAgIHN0YXR1czogNTAwLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgfSk7XG4gIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldE1vdGl2YXRpb25hbFF1b3RlKGFwaUtleSkge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtb2RlbDogJ2dwdC00by0yMDI0LTA4LTA2JyxcbiAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogJ0dpdmUgbWUgb25lIHNob3J0IG1vdGl2YXRpb25hbCBxdW90ZS4gTm8gYXR0cmlidXRpb24sIG5vIHF1b3RlcyBtYXJrcywganVzdCB0aGUgbGluZS4nIH0sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICB9KTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoJ3F1b3RlIHJlcXVlc3QgZmFpbGVkJyk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICByZXR1cm4gZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudC50cmltKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBcIllvdSdyZSBkb2luZyBiZXR0ZXIgdGhhbiB5b3UgdGhpbmsuXCI7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgcGF0aDogJy9hcGkvcGFyc2UnLFxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQSxJQUFPLGdCQUFRLE9BQU8sUUFBUTtBQUM1QixNQUFJLElBQUksV0FBVyxRQUFRO0FBQ3pCLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLE9BQU8scUJBQXFCLENBQUMsR0FBRztBQUFBLE1BQ25FLFFBQVE7QUFBQSxNQUNSLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQW1CO0FBQUEsSUFDaEQsQ0FBQztBQUFBLEVBQ0g7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
