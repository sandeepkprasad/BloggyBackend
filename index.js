const conntectToDB = require("./db");
const express = require("express");
const cors = require("cors");

conntectToDB();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

app.use("/user", require("./routes/auth"));
app.use("/blog", require("./routes/blogs"));

app.listen(PORT, () => {
  console.log("Bloggy is listening on PORT : " + PORT);
});
