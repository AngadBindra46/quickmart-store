require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3300;
const root = path.join(__dirname, "..");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.static(root));

// ── Store APIs ──
app.get("/api/products", (req, res) => {
  const { category, q } = req.query;
  if (q) return res.json(db.searchProducts(q));
  if (category) return res.json(db.getProductsByCategory(category));
  res.json(db.getActiveProducts());
});
app.get("/api/categories", (req, res) => res.json(db.getCategories()));

app.get("/api/products/low-stock", (req, res) => res.json(db.getLowStock()));
app.get("/api/products/:id", (req, res) => {
  const p = db.getProduct(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: "Not found" });
});

// ── Orders ──
app.get("/api/orders", (req, res) => {
  const { phone } = req.query;
  if (phone) return res.json(db.getOrdersByPhone(phone));
  res.json(db.getAllOrders());
});
app.get("/api/orders/:id", (req, res) => {
  const o = db.getOrder(req.params.id);
  o ? res.json(o) : res.status(404).json({ error: "Not found" });
});
app.post("/api/orders", (req, res) => {
  if (!req.body.customerName) return res.status(400).json({ error: "Customer name required" });
  res.status(201).json(db.createOrder(req.body));
});
app.put("/api/orders/:id", (req, res) => {
  const o = db.updateOrder(req.params.id, req.body);
  o ? res.json(o) : res.status(404).json({ error: "Not found" });
});

// ── Dashboard ──
app.get("/api/dashboard", (req, res) => res.json(db.getDashboardStats()));

app.listen(PORT, () => console.log(`
  ⚡ QuickMart
  ────────────
  Store:  http://localhost:${PORT}
  API:    http://localhost:${PORT}/api/products
`));
