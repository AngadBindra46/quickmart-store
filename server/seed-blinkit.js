require("dotenv").config();
const db = require("./db");
const Database = require("better-sqlite3");
const path = require("path");

const rawDb = new Database(path.join(__dirname, "quickmart.db"));
rawDb.exec("DELETE FROM products");
rawDb.close();

const P = (name, sku, cat, price, mrp, cost, stock, weight, image, desc) =>
  db.createProduct({ name, sku, category: cat, price, mrp, cost, stock, lowStock: 10, unit: "pcs", weight, image, description: desc, status: "active" });

// ═══ Fruits & Vegetables ═══
P("Fresh Banana (1 dozen)", "FV-BAN-001", "Fruits & Vegetables", 40, 50, 20, 200, "12 pcs", "🍌", "Ripe yellow bananas, rich in potassium");
P("Onion (1 kg)", "FV-ONI-002", "Fruits & Vegetables", 35, 40, 18, 300, "1 kg", "🧅", "Fresh red onions, firm and pungent");
P("Tomato (1 kg)", "FV-TOM-003", "Fruits & Vegetables", 30, 40, 15, 250, "1 kg", "🍅", "Fresh red tomatoes, juicy and ripe");
P("Potato (1 kg)", "FV-POT-004", "Fruits & Vegetables", 25, 30, 12, 300, "1 kg", "🥔", "Clean sorted potatoes");
P("Apple Shimla (1 kg)", "FV-APP-005", "Fruits & Vegetables", 180, 220, 100, 80, "1 kg", "🍎", "Premium Shimla apples, crisp and sweet");
P("Green Capsicum (500g)", "FV-CAP-006", "Fruits & Vegetables", 40, 50, 20, 120, "500 g", "🫑", "Fresh green bell peppers");
P("Lemon (6 pcs)", "FV-LEM-007", "Fruits & Vegetables", 20, 25, 8, 150, "6 pcs", "🍋", "Juicy lemons for daily use");

// ═══ Dairy & Bread ═══
P("Amul Toned Milk (500ml)", "DB-MLK-001", "Dairy & Bread", 27, 27, 22, 200, "500 ml", "🥛", "Pasteurized toned milk, 3% fat");
P("Amul Butter (100g)", "DB-BUT-002", "Dairy & Bread", 56, 58, 42, 150, "100 g", "🧈", "Pasteurized butter, salted");
P("Mother Dairy Curd (400g)", "DB-CRD-003", "Dairy & Bread", 40, 42, 28, 120, "400 g", "🥣", "Fresh set curd, creamy texture");
P("Britannia White Bread", "DB-BRD-004", "Dairy & Bread", 40, 42, 25, 100, "400 g", "🍞", "Soft white sandwich bread");
P("Amul Cheese Slices (10 pcs)", "DB-CHS-005", "Dairy & Bread", 120, 130, 80, 80, "200 g", "🧀", "Processed cheese slices, great for sandwiches");
P("Eggs (12 pcs)", "DB-EGG-006", "Dairy & Bread", 84, 90, 60, 100, "12 pcs", "🥚", "Farm fresh white eggs");
P("Paneer Fresh (200g)", "DB-PNR-007", "Dairy & Bread", 80, 90, 50, 90, "200 g", "🧈", "Fresh cottage cheese, soft and creamy");

// ═══ Snacks & Munchies ═══
P("Lay's Classic Salted (52g)", "SN-LAY-001", "Snacks & Munchies", 20, 20, 12, 200, "52 g", "🥔", "Crispy potato chips, classic salted");
P("Kurkure Masala Munch (90g)", "SN-KUR-002", "Snacks & Munchies", 20, 20, 12, 180, "90 g", "🌶️", "Crunchy corn puffs, spicy masala");
P("Haldiram's Aloo Bhujia (200g)", "SN-ABH-003", "Snacks & Munchies", 55, 60, 32, 120, "200 g", "🥨", "Classic aloo bhujia namkeen");
P("Oreo Original Biscuit (120g)", "SN-ORE-004", "Snacks & Munchies", 30, 30, 18, 150, "120 g", "🍪", "Chocolate sandwich cookies with cream");
P("Britannia Good Day (75g)", "SN-GDY-005", "Snacks & Munchies", 20, 22, 12, 160, "75 g", "🍪", "Cashew cookies, perfect with tea");
P("Maggi Hot & Sweet Sauce (500g)", "SN-MGS-006", "Snacks & Munchies", 115, 125, 70, 80, "500 g", "🌶️", "Tomato chilli sauce, tangy and sweet");
P("Pringles Sour Cream (107g)", "SN-PRG-007", "Snacks & Munchies", 149, 149, 90, 60, "107 g", "🥔", "Stackable chips, sour cream & onion");

// ═══ Cold Drinks & Juices ═══
P("Coca-Cola (750ml)", "CD-COK-001", "Cold Drinks & Juices", 38, 40, 22, 200, "750 ml", "🥤", "Chilled cola, refreshing taste");
P("Thums Up (750ml)", "CD-THU-002", "Cold Drinks & Juices", 38, 40, 22, 180, "750 ml", "🥤", "Strong cola taste, extra fizz");
P("Real Mango Juice (1L)", "CD-RMJ-003", "Cold Drinks & Juices", 99, 110, 60, 100, "1 L", "🥭", "Alphonso mango juice, no added sugar");
P("Paper Boat Aam Panna (200ml)", "CD-PPB-004", "Cold Drinks & Juices", 30, 30, 18, 120, "200 ml", "🧃", "Raw mango drink, traditional recipe");
P("Red Bull Energy (250ml)", "CD-RDB-005", "Cold Drinks & Juices", 115, 125, 75, 60, "250 ml", "🫙", "Energy drink, gives you wings");
P("Bisleri Water (1L)", "CD-BSL-006", "Cold Drinks & Juices", 20, 20, 10, 500, "1 L", "💧", "Packaged drinking water");
P("Sprite (750ml)", "CD-SPR-007", "Cold Drinks & Juices", 38, 40, 22, 150, "750 ml", "🍋", "Clear lemon-lime soft drink");

// ═══ Instant & Frozen Food ═══
P("Maggi 2-Minute Noodles (Pack of 4)", "IF-MGI-001", "Instant & Frozen Food", 56, 56, 35, 200, "280 g", "🍜", "India's favourite instant noodles");
P("McCain French Fries (450g)", "IF-MCF-002", "Instant & Frozen Food", 145, 160, 85, 60, "450 g", "🍟", "Crispy golden french fries, ready to fry");
P("ITC Aashirvaad Atta Noodles (4pk)", "IF-ITC-003", "Instant & Frozen Food", 48, 52, 30, 100, "280 g", "🍜", "Whole wheat instant noodles");
P("Frozen Mixed Vegetables (500g)", "IF-FMV-004", "Instant & Frozen Food", 85, 95, 50, 70, "500 g", "🥦", "Peas, carrots, beans, corn mix");
P("Frozen Aloo Tikki (10 pcs)", "IF-FAT-005", "Instant & Frozen Food", 110, 120, 65, 50, "400 g", "🥘", "Ready to fry aloo tikki, crispy outside");
P("Cup Noodles Masala (70g)", "IF-CUP-006", "Instant & Frozen Food", 45, 45, 28, 100, "70 g", "🍜", "Just add hot water, ready in 3 min");

// ═══ Tea, Coffee & Health Drinks ═══
P("Tata Tea Gold (500g)", "TC-TTG-001", "Tea, Coffee & Health Drinks", 260, 285, 160, 80, "500 g", "🍵", "Premium blend, rich and aromatic");
P("Nescafe Classic Coffee (50g)", "TC-NSC-002", "Tea, Coffee & Health Drinks", 155, 170, 95, 90, "50 g", "☕", "Instant coffee, smooth and rich");
P("Bournvita Health Drink (500g)", "TC-BVT-003", "Tea, Coffee & Health Drinks", 230, 250, 140, 60, "500 g", "🍫", "Chocolate health drink for kids");
P("Green Tea Honey Lemon (25 bags)", "TC-GTH-004", "Tea, Coffee & Health Drinks", 150, 175, 80, 70, "25 bags", "🍵", "Refreshing green tea with honey & lemon");
P("Horlicks (500g)", "TC-HOR-005", "Tea, Coffee & Health Drinks", 245, 270, 150, 55, "500 g", "🥛", "Health food drink, nutrients for growth");
P("Dabur Honey (500g)", "TC-DHN-006", "Tea, Coffee & Health Drinks", 215, 249, 130, 65, "500 g", "🍯", "100% pure honey, NMR tested");

// ═══ Atta, Rice & Dal ═══
P("Aashirvaad Atta (5 kg)", "AR-ASH-001", "Atta, Rice & Dal", 275, 310, 180, 80, "5 kg", "🌾", "Whole wheat atta, 0% maida");
P("India Gate Basmati Rice (5 kg)", "AR-IGR-002", "Atta, Rice & Dal", 450, 520, 280, 60, "5 kg", "🍚", "Premium aged basmati, long grain");
P("Toor Dal (1 kg)", "AR-TDL-003", "Atta, Rice & Dal", 140, 160, 85, 100, "1 kg", "🫘", "Unpolished toor dal, protein-rich");
P("Moong Dal (1 kg)", "AR-MDL-004", "Atta, Rice & Dal", 130, 150, 80, 90, "1 kg", "🫘", "Yellow moong dal, easy to digest");
P("Rajma Jammu (1 kg)", "AR-RJM-005", "Atta, Rice & Dal", 160, 180, 95, 70, "1 kg", "🫘", "Red kidney beans, Jammu origin");
P("Besan (500g)", "AR-BSN-006", "Atta, Rice & Dal", 55, 65, 32, 100, "500 g", "🌾", "Gram flour, ideal for pakoras & laddu");

// ═══ Masala, Oil & More ═══
P("MDH Chana Masala (100g)", "MO-MCM-001", "Masala, Oil & More", 60, 68, 35, 100, "100 g", "🌶️", "Authentic chana masala blend");
P("Fortune Sunflower Oil (1L)", "MO-FSO-002", "Masala, Oil & More", 135, 150, 85, 80, "1 L", "🫒", "Refined sunflower oil, light & healthy");
P("Tata Salt (1 kg)", "MO-TST-003", "Masala, Oil & More", 24, 24, 14, 200, "1 kg", "🧂", "Iodized vacuum evaporated salt");
P("Everest Garam Masala (100g)", "MO-EGM-004", "Masala, Oil & More", 72, 80, 42, 90, "100 g", "🌶️", "Premium garam masala blend");
P("Saffola Gold Oil (1L)", "MO-SGO-005", "Masala, Oil & More", 175, 195, 110, 60, "1 L", "🫒", "Blended edible oil, heart-healthy");
P("Haldi Powder (100g)", "MO-HLD-006", "Masala, Oil & More", 32, 38, 18, 120, "100 g", "🟡", "Pure turmeric powder, bright colour");
P("Sugar (1 kg)", "MO-SGR-007", "Masala, Oil & More", 45, 48, 28, 150, "1 kg", "🍬", "Refined white sugar, crystal clear");

// ═══ Sweet Tooth ═══
P("Cadbury Dairy Milk Silk (150g)", "ST-CDM-001", "Sweet Tooth", 170, 175, 100, 80, "150 g", "🍫", "Smooth, creamy milk chocolate");
P("Gulab Jamun Mix (200g)", "ST-GJM-002", "Sweet Tooth", 65, 75, 35, 60, "200 g", "🟤", "Ready to make gulab jamun, just add water");
P("Rasgulla Tin (1 kg)", "ST-RSG-003", "Sweet Tooth", 180, 210, 100, 50, "1 kg", "⚪", "Soft spongy rasgullas in sugar syrup");
P("Dark Fantasy Choco Fills (75g)", "ST-DFC-004", "Sweet Tooth", 40, 40, 24, 120, "75 g", "🍫", "Cookies with chocolate filling");
P("Soan Papdi (250g)", "ST-SNP-005", "Sweet Tooth", 80, 95, 45, 70, "250 g", "🟡", "Flaky crispy Indian sweet");
P("KitKat (37.3g)", "ST-KKT-006", "Sweet Tooth", 30, 30, 18, 150, "37.3 g", "🍫", "Have a break, have a KitKat");

// ═══ Baby Care ═══
P("Pampers Diapers (S, 22 pcs)", "BC-PMD-001", "Baby Care", 299, 350, 180, 40, "S - 22 pcs", "👶", "All-round protection, up to 12 hrs dry");
P("Cerelac Wheat (300g)", "BC-CRL-002", "Baby Care", 225, 250, 140, 50, "300 g", "🥣", "Stage 1 baby cereal, iron-fortified");
P("Johnson's Baby Shampoo (200ml)", "BC-JBS-003", "Baby Care", 175, 199, 100, 60, "200 ml", "🧴", "No more tears, gentle formula");
P("Himalaya Baby Cream (100ml)", "BC-HBC-004", "Baby Care", 95, 115, 55, 70, "100 ml", "🧴", "Extra soft, winter cherry & olive oil");
P("Wet Wipes (72 pcs)", "BC-WWT-005", "Baby Care", 110, 125, 65, 80, "72 pcs", "🧻", "Alcohol-free, gentle cleansing wipes");

// ═══ Cleaning Essentials ═══
P("Surf Excel Liquid (500ml)", "CE-SEL-001", "Cleaning Essentials", 135, 150, 80, 80, "500 ml", "🧴", "Liquid detergent, tough stain removal");
P("Vim Dishwash Bar (300g)", "CE-VDB-002", "Cleaning Essentials", 32, 35, 18, 200, "300 g", "🧽", "Lemon power, 2x grease cleaning");
P("Harpic Toilet Cleaner (500ml)", "CE-HTC-003", "Cleaning Essentials", 89, 99, 52, 100, "500 ml", "🧴", "Kills 99.9% germs, thick formula");
P("Colin Glass Cleaner (500ml)", "CE-CGC-004", "Cleaning Essentials", 99, 110, 58, 70, "500 ml", "✨", "Streak-free shine, spray bottle");
P("Lizol Floor Cleaner (500ml)", "CE-LFC-005", "Cleaning Essentials", 95, 105, 55, 80, "500 ml", "🧹", "Citrus disinfectant, kills 99.9% germs");
P("Garbage Bags (30 pcs)", "CE-GBG-006", "Cleaning Essentials", 80, 95, 40, 100, "30 pcs", "🗑️", "Medium size, biodegradable, sturdy");

// ═══ Personal Care ═══
P("Dove Soap (100g, 3+1 Pack)", "PC-DVS-001", "Personal Care", 199, 240, 120, 80, "4 x 100 g", "🧼", "1/4 moisturizing cream, soft smooth skin");
P("Colgate MaxFresh (150g)", "PC-CMF-002", "Personal Care", 95, 105, 55, 120, "150 g", "🪥", "Cooling crystals, fresh breath");
P("Head & Shoulders Shampoo (340ml)", "PC-HSS-003", "Personal Care", 280, 315, 170, 60, "340 ml", "🧴", "Anti-dandruff, cool menthol");
P("Gillette Guard Razor (3 pcs)", "PC-GGR-004", "Personal Care", 90, 99, 50, 80, "3 pcs", "🪒", "Close comfortable shave, 5 blade");
P("Nivea Body Lotion (200ml)", "PC-NBL-005", "Personal Care", 175, 195, 100, 70, "200 ml", "🧴", "Deep moisture, 48hr hydration");
P("Whisper Ultra (XL, 15 pads)", "PC-WUP-006", "Personal Care", 120, 135, 70, 90, "15 pads", "📦", "Dry top sheet, wings, thin design");
P("Dettol Handwash (200ml)", "PC-DHW-007", "Personal Care", 55, 62, 30, 150, "200 ml", "🧴", "Original, 99.9% germ protection");

console.log(`Seeded ${db.getAllProducts().length} Blinkit-style products.`);
