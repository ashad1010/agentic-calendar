
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
    const { input, mode } = await req.json();
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
    const systemPrompt = `You are an AI assistant that helps manage tasks. Today's date is ${today}.
Convert the user's input into a structured JSON action. Respond with ONLY valid JSON, no other text.

Formats:
- To add a task: {"action": "add_task", "description": "...", "due_date": "YYYY-MM-DD"}
- To view tasks: {"action": "view_tasks"}
- To remove a task: {"action": "remove_task", "description": "..."}
- If you cannot understand the input: {"action": "unknown"}

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvcGFyc2UuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEpID0+IHtcbiAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSksIHtcbiAgICAgIHN0YXR1czogNDA1LFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWTtcbiAgaWYgKCFhcGlLZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1NlcnZlciBtaXNzaW5nIE9QRU5BSV9BUElfS0VZJyB9KSxcbiAgICAgIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH1cbiAgICApO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB7IGlucHV0LCBtb2RlIH0gPSBhd2FpdCByZXEuanNvbigpO1xuXG4gICAgaWYgKG1vZGUgPT09ICdxdW90ZScpIHtcbiAgICAgIGNvbnN0IHF1b3RlID0gYXdhaXQgZ2V0TW90aXZhdGlvbmFsUXVvdGUoYXBpS2V5KTtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBxdW90ZSB9KSwge1xuICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdpbnB1dCBpcyByZXF1aXJlZCcgfSksIHtcbiAgICAgICAgc3RhdHVzOiA0MDAsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcblxuICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IGBZb3UgYXJlIGFuIEFJIGFzc2lzdGFudCB0aGF0IGhlbHBzIG1hbmFnZSB0YXNrcy4gVG9kYXkncyBkYXRlIGlzICR7dG9kYXl9LlxuQ29udmVydCB0aGUgdXNlcidzIGlucHV0IGludG8gYSBzdHJ1Y3R1cmVkIEpTT04gYWN0aW9uLiBSZXNwb25kIHdpdGggT05MWSB2YWxpZCBKU09OLCBubyBvdGhlciB0ZXh0LlxuXG5Gb3JtYXRzOlxuLSBUbyBhZGQgYSB0YXNrOiB7XCJhY3Rpb25cIjogXCJhZGRfdGFza1wiLCBcImRlc2NyaXB0aW9uXCI6IFwiLi4uXCIsIFwiZHVlX2RhdGVcIjogXCJZWVlZLU1NLUREXCJ9XG4tIFRvIHZpZXcgdGFza3M6IHtcImFjdGlvblwiOiBcInZpZXdfdGFza3NcIn1cbi0gVG8gcmVtb3ZlIGEgdGFzazoge1wiYWN0aW9uXCI6IFwicmVtb3ZlX3Rhc2tcIiwgXCJkZXNjcmlwdGlvblwiOiBcIi4uLlwifVxuLSBJZiB5b3UgY2Fubm90IHVuZGVyc3RhbmQgdGhlIGlucHV0OiB7XCJhY3Rpb25cIjogXCJ1bmtub3duXCJ9XG5cblVzZXIgSW5wdXQ6ICR7aW5wdXR9YDtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtb2RlbDogJ2dwdC00by0yMDI0LTA4LTA2JyxcbiAgICAgICAgbWVzc2FnZXM6IFt7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW1Qcm9tcHQgfV0sXG4gICAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0sXG4gICAgICB9KSxcbiAgICB9KTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnN0IGVyclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBgT3BlbkFJIGVycm9yOiAke2VyclRleHR9YCB9KSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMiwgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBkYXRhLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50O1xuICAgIGNvbnN0IHN0cnVjdHVyZWQgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShzdHJ1Y3R1cmVkKSwge1xuICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KSwge1xuICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9KTtcbiAgfVxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0TW90aXZhdGlvbmFsUXVvdGUoYXBpS2V5KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1vZGVsOiAnZ3B0LTRvLTIwMjQtMDgtMDYnLFxuICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiAnR2l2ZSBtZSBvbmUgc2hvcnQgbW90aXZhdGlvbmFsIHF1b3RlLiBObyBhdHRyaWJ1dGlvbiwgbm8gcXVvdGVzIG1hcmtzLCBqdXN0IHRoZSBsaW5lLicgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcigncXVvdGUgcmVxdWVzdCBmYWlsZWQnKTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIHJldHVybiBkYXRhLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50LnRyaW0oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFwiWW91J3JlIGRvaW5nIGJldHRlciB0aGFuIHlvdSB0aGluay5cIjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBwYXRoOiAnL2FwaS9wYXJz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
