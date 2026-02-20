import { env } from "#app/config/env.js";
import app from "./app.js";

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
