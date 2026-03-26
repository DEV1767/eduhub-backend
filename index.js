import app from "./app.js";
import { connect_db } from "./src/model/db.js";

const PORT = process.env.PORT || 8000;

connect_db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});