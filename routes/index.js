// routes/index.js
// TEMPLATE: just a home page, fill in the controller logic

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

module.exports = router;