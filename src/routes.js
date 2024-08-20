import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database
        .select(
          "tasks",
          search
            ? {
                title : decodeURIComponent(search),
                description: decodeURIComponent(search),
              }
            : null
        )
        ?.map((task) => {
          for (let key in task) {
            const dateProps = ["completed_at", "created_at", "updated_at"];
            if (task[key] && dateProps.some((prop) => prop === key))
              task[key] = new Date(task[key]).toLocaleString();
          }
          return task;
        });

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;
      if (!title || !description) return res.writeHead(400).end();
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: Date.now(),
        updated_at: null,
      };
      database.insert("tasks", task);
      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { title, description } = req.body;
      const { id } = req.params;
      if (!id || (!title && !description)) return res.writeHead(400).end();

      const task = database.selectById("tasks", id);
      if (!task) return res.writeHead(404).end();

      if (title) task.title = title;
      if (description) task.description = description;
      task.updated_at = Date.now();

      database.update("tasks", id, task);
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      if (!id) return res.writeHead(400).end();

      const task = database.selectById("tasks", id);
      if (!task) return res.writeHead(404).end();

      database.delete("tasks", id);
      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      if (!id) return res.writeHead(400).end();

      const task = database.selectById("tasks", id);
      if (!task) return res.writeHead(404).end();

      task.completed_at = Date.now();
      task.updated_at = Date.now();

      database.update("tasks", task);
      return res.writeHead(204).end();
    },
  },
];
