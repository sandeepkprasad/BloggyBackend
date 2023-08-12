const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT = "success";

// ROUTER POST 1 : Create a user using POST on "/user/signup".
router.post(
  "/signup",
  [
    body("name", "Name should be minimum 3 characters.").isLength({ min: 3 }),
    body("email", "Email not valid.").isEmail(),
    body("password", "Password should be minimum 6 characters.").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({ success, error: "User is already registered." });
      }

      const salt = await bcrypt.genSalt(10);
      const genPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: genPassword,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const jwtData = jwt.sign(data, JWT);
      success = true;
      res.json({ success, jwtData });
    } catch (error) {
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTER POST 2 : Login user using "/user/login".
router.post(
  "/login",
  [
    body("email", "Email is invalid.").isEmail(),
    body("password", "Password should be atleast 6 characters.").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.sta(400).json({ error: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ success, error: "Invalid credentials." });
    }

    try {
      const passCompared = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!passCompared) {
        return res.status(400).json({ success, error: "Invalid credentials." });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const jwtData = jwt.sign(payload, JWT);
      success = true;
      res.json({ success, jwtData });
    } catch (error) {
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE POST 3 : Getting the user details from the database. Login Reqquired
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
