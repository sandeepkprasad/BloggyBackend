const BlogSchema = require("../models/Blog");
const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");

// ROUTE 1 : Get all blogs on "blog/allblogs"
router.get("/allblogs", async (req, res) => {
  try {
    const allBlogs = await BlogSchema.find();
    res.send(allBlogs);
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 2 : Get blogs by user on "blog/userblogs"
router.get("/userblogs", fetchUser, async (req, res) => {
  try {
    const userBlogs = await BlogSchema.find({ user: req.user.id });
    res.send(userBlogs);
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 3 : Add a blog on "blog/addblog"
router.post("/addblog", fetchUser, async (req, res) => {
  const { author, image, category, title, description } = req.body;

  try {
    const blog = new BlogSchema({
      author,
      image,
      category,
      title,
      description,
      user: req.user.id,
    });

    const saveBlog = await blog.save();
    res.json(saveBlog);
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 4 : Update a blog on "blog/updateblog"
router.put("/updateblog/:id", fetchUser, async (req, res) => {
  const { author, image, category, title, description } = req.body;

  const newBlog = {};

  if (author) {
    newBlog.author = author;
  }

  if (image) {
    newBlog.image = image;
  }

  if (category) {
    newBlog.category = category;
  }

  if (title) {
    newBlog.title = title;
  }

  if (description) {
    newBlog.description = description;
  }

  let blog = await BlogSchema.findById(req.params.id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  if (blog.user.toString() !== req.user.id) {
    return res.status(401).send("User not allowed");
  }

  blog = await BlogSchema.findByIdAndUpdate(
    req.params.id,
    { $set: newBlog },
    { new: true }
  );

  res.json(blog);
});

// ROUTE 5 : Delete a blog on "/blog/deleteblog"
router.delete("/deleteblog/:id", fetchUser, async (req, res) => {
  try {
    let blog = await BlogSchema.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    blog = await BlogSchema.findByIdAndDelete(req.params.id);
    res.json({ success: "Blog Deleted" });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
