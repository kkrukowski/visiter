// Server setup
require("dotenv").config();
const port = process.env.PORT || 5000;
const {
  createApp,
  createServer,
  createSocketServer,
  createDbConnection,
} = require("./utils/server");
const app = createApp();
const server = createServer(app);
// Database - mongodb
const mongoose = require("mongoose");

// Routes
const loginApi = require("./routes/login");
const businessApi = require("./routes/business");
const visitApi = require("./routes/visit");
const profileApi = require("./routes/profile");
const chat = require("./routes/chat");
const routes = require("./routes/routes");

// APIs
app.use("/", chat);
app.use("/", loginApi);
app.use("/business", businessApi);
app.use("/profile", profileApi);
app.use("/visits", visitApi);
app.use("/business/visits", () => {});
app.use("/", routes);

// MongoDB connection
createDbConnection();

// Socket server
createSocketServer(server);

const mongoString = process.env.DATABASE_URL;
mongoose
  .connect(mongoString)
  .then(() => {
    console.log("Database Connected");

    if (process.env.NODE_ENV !== "test") {
      server.listen(port, () => {
        console.log(`Server started on port ${port}!`);
      });
    }
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = server;
