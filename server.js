const express = require("express");
const database = require("./database/database");

const app = express();

//MIDDLEWARES;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to my EmojiPedia");
});

//Database Connection;
database();

//Routers;
app.use("/api/user", require("./routers/api/registerUser"));
app.use("/api/login", require("./routers/api/loginUser"));
app.use("/api/emoji", require("./routers/api/emoji"));
app.use("/api/profile", require("./routers/api/profile"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`The Server has been started on local port ${PORT}`);
});
