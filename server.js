const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the current directory
const path = require("path");
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection
const pool = new Pool({
  user: "grantcross", // my macOS username
  host: "localhost",
  database: "food_storage_tracker",
  password: "", // leave blank because I have no password
  port: 5432,
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Get all food items
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM food_items ORDER BY id ASC");
    // Calculate daysLeft dynamically for each item
    const today = new Date();
    const items = result.rows.map((item) => {
      let daysLeft = null;
      if (item.use_by_date) {
        const useBy = new Date(item.use_by_date);
        // Calculate difference in days
        daysLeft = Math.ceil((useBy - today) / (1000 * 60 * 60 * 24));
      }
      return { ...item, days_left: daysLeft };
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Add a new food item
app.post("/items", async (req, res) => {
  const { name, description, storageType, dateStored, useByDate } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO food_items 
      (name, description, storage_type, date_stored, use_by_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, storageType, dateStored, useByDate]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update an existing food item
app.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, storageType, dateStored, useByDate } = req.body;
  try {
    const result = await pool.query(
      `UPDATE food_items 
      SET name = $1, description = $2, storage_type = $3, 
          date_stored = $4, use_by_date = $5
      WHERE id = $6 RETURNING *`,
      [name, description, storageType, dateStored, useByDate, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Item not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete a food item
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM food_items WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Item not found");
    }
    res.json({ message: "Item deleted", item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
