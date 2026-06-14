import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: "file:./dev.db", // path to your SQLite database file
  },
});

