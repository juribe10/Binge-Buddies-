// ✅ Import required modules
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

// ✅ Initialize Express
const app = express();  // ✅ FIXED: Removed extra dot (.) before app

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ghostcloud21!", // Change if needed
    database: "myself"
});

// ✅ Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed:", err);
        process.exit(1);
    }
    console.log("✅ Connected to MySQL Database!");
});

// ✅ Signup Route
app.post("/signup", (req, res) => {
    console.log("📩 Received signup request:", req.body);

    const { email } = req.body;

    if (!email || !email.includes("@")) {
        console.log("❌ Invalid email received:", email);
        return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    // ✅ Check if email already exists in `users` table
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            console.log("⚠️ Email already exists:", email);
            return res.status(400).json({ success: false, message: "Email already registered. Please sign in." });
        }

        // ✅ Insert email into `users` table
        const insertSql = "INSERT INTO users (email) VALUES (?)";
        db.query(insertSql, [email], (err, result) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            console.log("✅ Email saved successfully!");
            res.json({ success: true, message: "Signup successful!", userId: result.insertId });
        });
    });
});

// ✅ Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// ✅ Sign-In Route
app.post("/signin", (req, res) => {
    console.log("🔑 Received login request:", req.body);

    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    // ✅ Check if email exists in `users` table
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            console.log("✅ User found:", email);
            res.json({ success: true, message: "Login successful!", redirect: "http://localhost:3000/movies.html" });

        } else {
            console.log("❌ User not found:", email);
            res.status(401).json({ success: false, message: "Email not found. Please sign up first." });
        }
    });
});




