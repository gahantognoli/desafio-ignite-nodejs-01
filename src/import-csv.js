import assert from "node:assert";
import { generate } from "csv-generate";
import { parse } from "csv-parse";

(async () => {
  const parser = generate({
    columns: ["ascii", "ascii"],
    length: 100,
  }).pipe(parse());
  for await (const record of parser) {
    fetch("http://localhost:3333/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: record[0],
        description: record[1],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((_) => {
        console.log("Task criada com sucesso!");
      })
      .catch((err) => {
        console.error(err);
      });
  }
})();
