const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "quickmart.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    sku           TEXT UNIQUE NOT NULL,
    category      TEXT NOT NULL DEFAULT '',
    price         REAL NOT NULL DEFAULT 0,
    mrp           REAL NOT NULL DEFAULT 0,
    cost          REAL NOT NULL DEFAULT 0,
    stock         INTEGER NOT NULL DEFAULT 0,
    low_stock     INTEGER NOT NULL DEFAULT 10,
    unit          TEXT DEFAULT 'pcs',
    weight        TEXT DEFAULT '',
    image         TEXT DEFAULT '',
    supplier      TEXT DEFAULT '',
    description   TEXT DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_prod_cat    ON products(category);
  CREATE INDEX IF NOT EXISTS idx_prod_status ON products(status);
  CREATE INDEX IF NOT EXISTS idx_prod_sku    ON products(sku);

  CREATE TABLE IF NOT EXISTS orders (
    id             TEXT PRIMARY KEY,
    order_no       TEXT UNIQUE NOT NULL,
    customer_name  TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    customer_email TEXT DEFAULT '',
    customer_addr  TEXT DEFAULT '',
    items          TEXT NOT NULL DEFAULT '[]',
    subtotal       REAL NOT NULL DEFAULT 0,
    tax            REAL NOT NULL DEFAULT 0,
    discount       REAL NOT NULL DEFAULT 0,
    delivery_fee   REAL NOT NULL DEFAULT 0,
    total          REAL NOT NULL DEFAULT 0,
    payment_mode   TEXT DEFAULT 'Cash',
    payment_status TEXT DEFAULT 'unpaid',
    status         TEXT NOT NULL DEFAULT 'pending',
    notes          TEXT DEFAULT '',
    created_at     INTEGER NOT NULL,
    updated_at     INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_ord_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_ord_phone  ON orders(customer_phone);
`);

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function san(v) { return typeof v === "string" ? v.replace(/<[^>]*>/g, "").trim().slice(0, 2000) : ""; }

// ─── Products ───
const prodSt = {
  ins: db.prepare(`INSERT INTO products (id,name,sku,category,price,mrp,cost,stock,low_stock,unit,weight,image,supplier,description,status,created_at,updated_at)
    VALUES (@id,@name,@sku,@category,@price,@mrp,@cost,@stock,@lowStock,@unit,@weight,@image,@supplier,@description,@status,@createdAt,@updatedAt)`),
  upd: db.prepare(`UPDATE products SET name=@name,sku=@sku,category=@category,price=@price,mrp=@mrp,cost=@cost,stock=@stock,low_stock=@lowStock,
    unit=@unit,weight=@weight,image=@image,supplier=@supplier,description=@description,status=@status,updated_at=@updatedAt WHERE id=@id`),
  all: db.prepare("SELECT * FROM products ORDER BY category, name"),
  active: db.prepare("SELECT * FROM products WHERE status='active' ORDER BY category, name"),
  byId: db.prepare("SELECT * FROM products WHERE id=?"),
  del: db.prepare("DELETE FROM products WHERE id=?"),
  lowStock: db.prepare("SELECT * FROM products WHERE stock <= low_stock AND status='active' ORDER BY stock ASC"),
  updateStock: db.prepare("UPDATE products SET stock=stock+?, updated_at=? WHERE id=?"),
  byCategory: db.prepare("SELECT * FROM products WHERE category=? AND status='active' ORDER BY name"),
  categories: db.prepare("SELECT DISTINCT category FROM products WHERE status='active' AND category!='' ORDER BY category"),
  search: db.prepare("SELECT * FROM products WHERE status='active' AND (name LIKE ? OR category LIKE ? OR description LIKE ?) ORDER BY name"),
};

function rowProd(r) {
  return { id:r.id, name:r.name, sku:r.sku, category:r.category, price:r.price, mrp:r.mrp, cost:r.cost,
    stock:r.stock, lowStock:r.low_stock, unit:r.unit, weight:r.weight||"", image:r.image||"",
    supplier:r.supplier, description:r.description, status:r.status,
    createdAt:r.created_at, updatedAt:r.updated_at };
}

exports.createProduct = d => {
  const now = Date.now();
  const p = { id:genId(), name:san(d.name), sku:san(d.sku), category:san(d.category||""),
    price:parseFloat(d.price)||0, mrp:parseFloat(d.mrp)||0, cost:parseFloat(d.cost)||0,
    stock:parseInt(d.stock)||0, lowStock:parseInt(d.lowStock)||10, unit:san(d.unit||"pcs"),
    weight:san(d.weight||""), image:san(d.image||""), supplier:san(d.supplier||""),
    description:san(d.description||""), status:san(d.status||"active"),
    createdAt:d.createdAt||now, updatedAt:now };
  prodSt.ins.run(p);
  return p;
};

exports.updateProduct = (id, d) => {
  const e = prodSt.byId.get(id); if (!e) return null;
  const u = { id, name:san(d.name??e.name), sku:san(d.sku??e.sku), category:san(d.category??e.category),
    price:parseFloat(d.price??e.price)||0, mrp:parseFloat(d.mrp??e.mrp)||0, cost:parseFloat(d.cost??e.cost)||0,
    stock:parseInt(d.stock??e.stock)||0, lowStock:parseInt(d.lowStock??e.low_stock)||10,
    unit:san(d.unit??e.unit), weight:san(d.weight??e.weight), image:san(d.image??e.image),
    supplier:san(d.supplier??e.supplier), description:san(d.description??e.description),
    status:san(d.status??e.status), updatedAt:Date.now() };
  prodSt.upd.run(u);
  return rowProd(prodSt.byId.get(id));
};

exports.getAllProducts = () => prodSt.all.all().map(rowProd);
exports.getActiveProducts = () => prodSt.active.all().map(rowProd);
exports.getProduct = id => { const r=prodSt.byId.get(id); return r?rowProd(r):null; };
exports.deleteProduct = id => prodSt.del.run(id).changes > 0;
exports.getLowStock = () => prodSt.lowStock.all().map(rowProd);
exports.adjustStock = (id, qty) => { prodSt.updateStock.run(qty, Date.now(), id); };
exports.getProductsByCategory = cat => prodSt.byCategory.all(cat).map(rowProd);
exports.getCategories = () => prodSt.categories.all().map(r => r.category);
exports.searchProducts = q => { const like = `%${q}%`; return prodSt.search.all(like, like, like).map(rowProd); };

// ─── Orders ───
let orderCounter = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
const ordSt = {
  ins: db.prepare(`INSERT INTO orders (id,order_no,customer_name,customer_phone,customer_email,customer_addr,items,subtotal,tax,discount,delivery_fee,total,payment_mode,payment_status,status,notes,created_at,updated_at)
    VALUES (@id,@orderNo,@customerName,@customerPhone,@customerEmail,@customerAddr,@items,@subtotal,@tax,@discount,@deliveryFee,@total,@paymentMode,@paymentStatus,@status,@notes,@createdAt,@updatedAt)`),
  upd: db.prepare(`UPDATE orders SET customer_name=@customerName,customer_phone=@customerPhone,customer_email=@customerEmail,customer_addr=@customerAddr,
    items=@items,subtotal=@subtotal,tax=@tax,discount=@discount,delivery_fee=@deliveryFee,total=@total,payment_mode=@paymentMode,payment_status=@paymentStatus,
    status=@status,notes=@notes,updated_at=@updatedAt WHERE id=@id`),
  all: db.prepare("SELECT * FROM orders ORDER BY created_at DESC"),
  byId: db.prepare("SELECT * FROM orders WHERE id=?"),
  byPhone: db.prepare("SELECT * FROM orders WHERE customer_phone=? ORDER BY created_at DESC"),
  del: db.prepare("DELETE FROM orders WHERE id=?"),
};

function rowOrd(r) {
  let items = []; try { items = JSON.parse(r.items); } catch {}
  return { id:r.id, orderNo:r.order_no, customerName:r.customer_name, customerPhone:r.customer_phone,
    customerEmail:r.customer_email, customerAddr:r.customer_addr, items, subtotal:r.subtotal,
    tax:r.tax, discount:r.discount, deliveryFee:r.delivery_fee||0, total:r.total,
    paymentMode:r.payment_mode, paymentStatus:r.payment_status, status:r.status, notes:r.notes,
    createdAt:r.created_at, updatedAt:r.updated_at };
}

exports.createOrder = d => {
  const now = Date.now();
  orderCounter++;
  const items = Array.isArray(d.items) ? d.items : [];
  const subtotal = parseFloat(d.subtotal) || items.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0);
  const tax = parseFloat(d.tax) || Math.round(subtotal * 0.05);
  const discount = parseFloat(d.discount) || 0;
  const deliveryFee = parseFloat(d.deliveryFee) || 0;
  const o = { id:genId(), orderNo: d.orderNo || `QM-${String(orderCounter).padStart(5,"0")}`,
    customerName:san(d.customerName), customerPhone:san(d.customerPhone||""), customerEmail:san(d.customerEmail||""),
    customerAddr:san(d.customerAddr||""), items:JSON.stringify(items), subtotal, tax, discount, deliveryFee,
    total:parseFloat(d.total) || (subtotal + tax + deliveryFee - discount),
    paymentMode:san(d.paymentMode||"Cash"), paymentStatus:san(d.paymentStatus||"unpaid"),
    status:san(d.status||"pending"), notes:san(d.notes||""), createdAt:now, updatedAt:now };
  ordSt.ins.run(o);
  for (const item of items) {
    if (item.productId) {
      prodSt.updateStock.run(-(item.qty || 1), Date.now(), item.productId);
    }
  }
  return { ...o, items };
};

exports.updateOrder = (id, d) => {
  const e = ordSt.byId.get(id); if (!e) return null;
  const items = d.items !== undefined ? (Array.isArray(d.items) ? d.items : JSON.parse(e.items)) : JSON.parse(e.items);
  const u = { id, customerName:san(d.customerName??e.customer_name), customerPhone:san(d.customerPhone??e.customer_phone),
    customerEmail:san(d.customerEmail??e.customer_email), customerAddr:san(d.customerAddr??e.customer_addr),
    items:JSON.stringify(items), subtotal:parseFloat(d.subtotal??e.subtotal)||0, tax:parseFloat(d.tax??e.tax)||0,
    discount:parseFloat(d.discount??e.discount)||0, deliveryFee:parseFloat(d.deliveryFee??e.delivery_fee)||0,
    total:parseFloat(d.total??e.total)||0, paymentMode:san(d.paymentMode??e.payment_mode),
    paymentStatus:san(d.paymentStatus??e.payment_status), status:san(d.status??e.status),
    notes:san(d.notes??e.notes), updatedAt:Date.now() };
  ordSt.upd.run(u);
  return rowOrd(ordSt.byId.get(id));
};

exports.getAllOrders = () => ordSt.all.all().map(rowOrd);
exports.getOrder = id => { const r=ordSt.byId.get(id); return r?rowOrd(r):null; };
exports.getOrdersByPhone = phone => ordSt.byPhone.all(phone).map(rowOrd);
exports.deleteOrder = id => ordSt.del.run(id).changes > 0;

// ─── Stats ───
exports.getDashboardStats = () => {
  const products = prodSt.all.all();
  const orders = ordSt.all.all();
  const totalRevenue = orders.reduce((s,o) => s + o.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.low_stock && p.status === "active").length;
  const ordersByStatus = {};
  orders.forEach(o => { ordersByStatus[o.status] = (ordersByStatus[o.status]||0)+1; });
  return { totalProducts:products.length, totalOrders:orders.length, totalRevenue, lowStockCount, ordersByStatus };
};
