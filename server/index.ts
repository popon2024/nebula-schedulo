import express from "express";
import cors from "cors";
import bookingsRoute from "./routes/bookings.js";
import usersRoute from "./routes/users.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingsRoute);
app.use("/api/users", usersRoute);

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));