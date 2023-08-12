const jwt = require("jsonwebtoken");

const JWT = "success";

const fetchUser = (req, res, next) => {
  const token = req.header("authtoken");

  if (!token) {
    return res.status(401).send({ error: "Invalid token." });
  }

  try {
    const data = jwt.verify(token, JWT);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
};

module.exports = fetchUser;
