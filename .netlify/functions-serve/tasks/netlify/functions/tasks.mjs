
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/tasks.js
import { getStore } from "@netlify/blobs";
var STORE_NAME = "tasks-store";
var KEY = "tasks";
async function readTasks(store) {
  const data = await store.get(KEY, { type: "json" });
  return data || [];
}
async function writeTasks(store, tasks) {
  await store.setJSON(KEY, tasks);
}
var tasks_default = async (req) => {
  const store = getStore(STORE_NAME);
  try {
    if (req.method === "GET") {
      const tasks = await readTasks(store);
      return new Response(JSON.stringify({ tasks }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (req.method === "POST") {
      const body = await req.json();
      const { description, due_date } = body;
      if (!description || !due_date) {
        return new Response(
          JSON.stringify({ error: "description and due_date are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const parsed = new Date(due_date);
      if (isNaN(parsed.getTime())) {
        return new Response(
          JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const tasks = await readTasks(store);
      const newTask = {
        id: crypto.randomUUID(),
        description,
        due_date,
        // stored as YYYY-MM-DD
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      tasks.push(newTask);
      await writeTasks(store, tasks);
      return new Response(JSON.stringify({ task: newTask }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      const name = url.searchParams.get("name");
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
          JSON.stringify({ error: "id or name query param required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      await writeTasks(store, tasks);
      return new Response(JSON.stringify({ removed }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
var config = {
  path: "/api/tasks"
};
export {
  config,
  tasks_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvdGFza3MuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGdldFN0b3JlIH0gZnJvbSAnQG5ldGxpZnkvYmxvYnMnO1xuXG5jb25zdCBTVE9SRV9OQU1FID0gJ3Rhc2tzLXN0b3JlJztcbmNvbnN0IEtFWSA9ICd0YXNrcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRUYXNrcyhzdG9yZSkge1xuICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmUuZ2V0KEtFWSwgeyB0eXBlOiAnanNvbicgfSk7XG4gIHJldHVybiBkYXRhIHx8IFtdO1xufVxuXG5hc3luYyBmdW5jdGlvbiB3cml0ZVRhc2tzKHN0b3JlLCB0YXNrcykge1xuICBhd2FpdCBzdG9yZS5zZXRKU09OKEtFWSwgdGFza3MpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxKSA9PiB7XG4gIGNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoU1RPUkVfTkFNRSk7XG5cbiAgdHJ5IHtcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgIGNvbnN0IHRhc2tzID0gYXdhaXQgcmVhZFRhc2tzKHN0b3JlKTtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyB0YXNrcyB9KSwge1xuICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxLmpzb24oKTtcbiAgICAgIGNvbnN0IHsgZGVzY3JpcHRpb24sIGR1ZV9kYXRlIH0gPSBib2R5O1xuXG4gICAgICBpZiAoIWRlc2NyaXB0aW9uIHx8ICFkdWVfZGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdkZXNjcmlwdGlvbiBhbmQgZHVlX2RhdGUgYXJlIHJlcXVpcmVkJyB9KSxcbiAgICAgICAgICB7IHN0YXR1czogNDAwLCBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFZhbGlkYXRlIGRhdGUgZm9ybWF0XG4gICAgICBjb25zdCBwYXJzZWQgPSBuZXcgRGF0ZShkdWVfZGF0ZSk7XG4gICAgICBpZiAoaXNOYU4ocGFyc2VkLmdldFRpbWUoKSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW52YWxpZCBkYXRlIGZvcm1hdC4gVXNlIFlZWVktTU0tREQuJyB9KSxcbiAgICAgICAgICB7IHN0YXR1czogNDAwLCBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhc2tzID0gYXdhaXQgcmVhZFRhc2tzKHN0b3JlKTtcbiAgICAgIGNvbnN0IG5ld1Rhc2sgPSB7XG4gICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgZHVlX2RhdGUsIC8vIHN0b3JlZCBhcyBZWVlZLU1NLUREXG4gICAgICAgIGNyZWF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIH07XG4gICAgICB0YXNrcy5wdXNoKG5ld1Rhc2spO1xuICAgICAgYXdhaXQgd3JpdGVUYXNrcyhzdG9yZSwgdGFza3MpO1xuXG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgdGFzazogbmV3VGFzayB9KSwge1xuICAgICAgICBzdGF0dXM6IDIwMSxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0RFTEVURScpIHtcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XG4gICAgICBjb25zdCBpZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdpZCcpO1xuICAgICAgY29uc3QgbmFtZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCduYW1lJyk7XG5cbiAgICAgIGxldCB0YXNrcyA9IGF3YWl0IHJlYWRUYXNrcyhzdG9yZSk7XG4gICAgICBsZXQgcmVtb3ZlZCA9IG51bGw7XG5cbiAgICAgIGlmIChpZCkge1xuICAgICAgICByZW1vdmVkID0gdGFza3MuZmluZCgodCkgPT4gdC5pZCA9PT0gaWQpIHx8IG51bGw7XG4gICAgICAgIHRhc2tzID0gdGFza3MuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSBpZCk7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUpIHtcbiAgICAgICAgcmVtb3ZlZCA9IHRhc2tzLmZpbmQoXG4gICAgICAgICAgKHQpID0+IHQuZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICkgfHwgbnVsbDtcbiAgICAgICAgdGFza3MgPSB0YXNrcy5maWx0ZXIoXG4gICAgICAgICAgKHQpID0+IHQuZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKSAhPT0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdpZCBvciBuYW1lIHF1ZXJ5IHBhcmFtIHJlcXVpcmVkJyB9KSxcbiAgICAgICAgICB7IHN0YXR1czogNDAwLCBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHdyaXRlVGFza3Moc3RvcmUsIHRhc2tzKTtcblxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IHJlbW92ZWQgfSksIHtcbiAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSwge1xuICAgICAgc3RhdHVzOiA0MDUsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KSwge1xuICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9KTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgcGF0aDogJy9hcGkvdGFza3MnLFxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQSxTQUFTLGdCQUFnQjtBQUV6QixJQUFNLGFBQWE7QUFDbkIsSUFBTSxNQUFNO0FBRVosZUFBZSxVQUFVLE9BQU87QUFDOUIsUUFBTSxPQUFPLE1BQU0sTUFBTSxJQUFJLEtBQUssRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUNsRCxTQUFPLFFBQVEsQ0FBQztBQUNsQjtBQUVBLGVBQWUsV0FBVyxPQUFPLE9BQU87QUFDdEMsUUFBTSxNQUFNLFFBQVEsS0FBSyxLQUFLO0FBQ2hDO0FBRUEsSUFBTyxnQkFBUSxPQUFPLFFBQVE7QUFDNUIsUUFBTSxRQUFRLFNBQVMsVUFBVTtBQUVqQyxNQUFJ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
