import app from "./app.js";
import { connect_db } from "./src/model/db.js"

const PORT = 8000 || process.env.PORT;



app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

connect_db()