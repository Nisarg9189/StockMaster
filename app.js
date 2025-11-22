const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const { User, Product, Receipt, Delivery, Transfer, Adjustment, Operation } = require("./models/models.js");

mongoose.connect("mongodb://127.0.0.1:27017/stockmaster")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files if needed
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("auth.ejs");
    // res.redirect("/dashboard");
});

app.post("/signin", async (req, res) => {
    let data = req.body.stock.email;
    let result = await User.findOne({ email: data });
    // console.log(result._id);

    res.redirect(`/dashboard/${result._id}`);
})

app.get("/dashboard/:adminId", async (req, res) => {
    let { adminId } = req.params;
    console.log(adminId);

    // Total products
    const totalProducts = await Product.countDocuments({ adminId });
    // console.log("totalProducts", totalProducts);

    // Pending receipts
    const pendingReceipts = await Receipt.countDocuments({
        adminId,
        status: { $ne: "Received" }
    });

    // console.log("pendingReceipts", pendingReceipts);

    // Pending deliveries
    const pendingDeliveries = await Delivery.countDocuments({
        adminId,
        status: { $ne: "Delivered" }
    });

    // console.log("pendingDeliveries",pendingDeliveries);

    // Internal transfers (all transfers for admin)
    const internalTransfers = await Transfer.countDocuments({ adminId }).populate("productId");
    // Query all operations of type delivery, transfer, adjustment
    const ops = await Operation.find({
        adminId,
        type: { $in: ["delivery", "transfer", "adjustment"] }
    })
        .populate("productId")  // get product details
        .sort({ date: -1 });   // newest first
    console.log(ops);
    // console.log("internalTransfers", internalTransfers);

    res.render("dashboard.ejs", { totalProducts, pendingDeliveries, pendingReceipts, internalTransfers, ops, adminId });
});

app.get("/products/:adminId", async (req, res) => {
    let { adminId } = req.params;
    console.log(adminId);
    // Get all products
    const products = await Product.find({ adminId }).lean();

    const result = [];

    for (let product of products) {
        // Find latest transfer for this product to determine location
        const latestTransfer = await Transfer.findOne({
            adminId,
            productId: product._id
        }).sort({ date: -1 }).lean();

        result.push({
            _id: product._id,
            Product: product.name,
            SKU: product.sku,
            Category: product.category,
            Stock: product.quantity,
            Status: product.quantity <= product.lowStockLimit ? "Low" : "OK",
            Location: latestTransfer ? latestTransfer.toLocation : "Warehouse A"
        });
    }
    console.log(result);
    res.render("product.ejs", { adminId, result });
});

app.post("/products/add/:adminId", async (req, res) => {
    let { adminId } = req.params;
    const product = new Product({ adminId, ...req.body.stock });
    await product.save();

    res.redirect(`/products/${adminId}`);

});

app.put("/products/:id/:adminId", async (req, res) => {
    let {id, adminId} = req.params;
    const updatedData = req.body.product;
    await Product.findByIdAndUpdate(id, updatedData, { new: true });
    res.redirect(`/products/${adminId}`);
})


app.get("/receipts/:adminId", async (req, res) => {
    let { adminId } = req.params;
    const receipts = await Receipt.find({ adminId })
        .populate("productId") // get product details
        .sort({ date: -1 }) // latest first
        .lean();
    console.log(receipts);
    const products = await Product.find({ adminId }).sort({ name: 1 }); // sorted by name
    res.render("receipts", { adminId, receipts, products });
});

app.post("/receipts/add/:adminId", async (req, res) => {
    let { adminId } = req.params;

    const { receipt } = req.body; // comes from receipt[field] inputs

    // Optional: Auto-generate reference if not provided
    let reference = receipt.reference;
    if (!reference) {
        const lastReceipt = await Receipt.find({ adminId }).sort({ createdAt: -1 }).limit(1);
        let nextNumber = 1;
        if (lastReceipt.length > 0) {
            const match = lastReceipt[0].reference.match(/\d+$/);
            if (match) nextNumber = parseInt(match[0]) + 1;
        }
        reference = `REC-2024-${String(nextNumber).padStart(3, '0')}`;
    }

    const newReceipt = new Receipt({
        adminId,
        productId: receipt.productId,
        reference,
        supplier: receipt.vendor,
        quantity: receipt.quantity,
        date: receipt.date,
        status: "Waiting",
        notes: receipt.notes || ""
    });


    let data = await newReceipt.save();
    console.log("newData : ", data);
    res.redirect(`/receipts/${adminId}`);
});

app.get("/deliveries/:adminId", async (req, res) => {
    let { adminId } = req.params;
    const deliveries = await Delivery.find({ adminId })
        .populate("productId") // get product details
        .sort({ date: -1 }) // latest first
        .lean();
    console.log(deliveries);
    const products = await Product.find({ adminId }).sort({ name: 1 });
    res.render("deliveries", { deliveries, adminId, products });
});

app.post("/deliveries/add/:adminId", async(req, res) => {
    let {adminId} = req.params;
        const { productId, customer, quantity, date } = req.body.delivery;

    // Validate input
    if (!productId || !customer || !quantity || !date) {
      return res.status(400).send("All fields are required");
    }

    // Create reference automatically
    const reference = `DEL-${Date.now()}`;

    // Create new delivery
    const newDelivery = await Delivery.create({
      adminId,
      productId,
      customer,
      quantity,
      date,
      reference,
      status: "Draft"
    });

    // Update product stock (decrease)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    product.quantity -= Number(quantity);
    if (product.quantity < 0) product.quantity = 0; // prevent negative stock
    await product.save();

    // Redirect back to dashboard or delivery page
    res.redirect(`/deliveries/${adminId}`);
})

app.get("/transfers/:adminId", async (req, res) => {
    let { adminId } = req.params;
    const transfers = await Transfer.find({ adminId }).populate("productId")
        .sort({ date: -1 })
        .lean();
    console.log(transfers);
    const products = await Product.find({ adminId }).sort({ name: 1 });
    res.render("transfers", { transfers, adminId, products});
});

app.post("/transfers/add/:adminId", async(req, res) => {
    let {adminId} = req.params;
    const { productId, fromLocation, toLocation, quantity } = req.body.transfer;

    if (!productId || !fromLocation || !toLocation || !quantity) {
      return res.status(400).send("All fields are required");
    }

    // Reference
    const reference = `TRF-${Date.now()}`;

    // Create new transfer
    const newTransfer = await Transfer.create({
      adminId,
      productId,
      fromLocation,
      toLocation,
      quantity,
      reference,
      status: "Waiting",
      date: new Date()
    });

    res.redirect(`/transfers/${adminId}`);
})

app.get("/adjustments/:adminId", async (req, res) => {
    let { adminId } = req.params;
    const adjustments = await Adjustment.find({ adminId })
        .populate("productId") // get product details
        .sort({ date: -1 })
        .lean();
    console.log(adjustments);
    const products = await Product.find({ adminId }).sort({ name: 1 });
    res.render("adjustments", { adminId, adjustments, products });
});

app.post("/adjustments/add/:adminId", async(req, res) => {
    let {adminId} = req.params;
    const { productId, location, countedQuantity, reason } = req.body.adjustment;

    // Fetch the current stock of the product at the location (if you track per location)
    // For simplicity, assuming you have Product model with quantity
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const oldQuantity = product.stock || 0; // change to your stock field
    const change = countedQuantity - oldQuantity; // calculate adjustment

    // Generate a reference (e.g., ADJ-2025-001)
    const lastAdjustment = await Adjustment.findOne({}).sort({ createdAt: -1 });
    const refNumber = lastAdjustment
      ? parseInt(lastAdjustment.reference.split("-")[2]) + 1
      : 1;
    const reference = `ADJ-${new Date().getFullYear()}-${refNumber.toString().padStart(3, "0")}`;

    // Create new adjustment
    const adjustment = new Adjustment({
      adminId: new mongoose.Types.ObjectId(adminId),
      productId,
      reference,
      change,
      reason,
      date: new Date(),
    });

    await adjustment.save();

    // Optionally update product stock
    product.stock = countedQuantity;
    await product.save();

    res.redirect(`/adjustments/${adminId}`);
})

app.get("/ledger/:adminId", (req, res) => {
    let { adminId } = req.params;
    res.render("ledger");
});

app.get("/settings/:adminId", (req, res) => {
    let { adminId } = req.params;
    res.render("settings", { adminId });
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.get("/product/details/:id", async (req, res) => {
    let {id} = req.params;

    let data = await Product.findById(id);
    console.log("ppp", data);

    res.json(data);
})


app.listen("8080", () => {
    console.log("port listing on 8080");
})