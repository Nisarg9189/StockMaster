
const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "admin" },
    createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    sku: { type: String, unique: true },
    category: String,
    unitPrice: Number,
    quantity: { type: Number, default: 0 },
    lowStockLimit: Number,
    createdAt: { type: Date, default: Date.now }
});

const ReceiptSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    reference: String,
    supplier: String,
    quantity: Number,
    status: { type: String, default: "Waiting" },
    date: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const DeliverySchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    reference: String,
    customer: String,
    quantity: Number,
    status: { type: String, default: "Draft" },
    date: Date,
    createdAt: { type: Date, default: Date.now }
});

const TransferSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    reference: String,
    fromLocation: String,
    toLocation: String,
    quantity: Number,
    status: { type: String, default: "Waiting" },
    date: Date,
    createdAt: { type: Date, default: Date.now }
});

const AdjustmentSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    reference: String,
    change: Number,
    reason: String,
    date: Date,
    createdAt: { type: Date, default: Date.now }
});

const OperationSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    reference: String,
    type: String,       // receipt, delivery, transfer, adjustment
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    status: String,
    date: Date,
    createdAt: { type: Date, default: Date.now }
});


const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Receipt = mongoose.model("Receipt", ReceiptSchema);
const Delivery = mongoose.model("Delivery", DeliverySchema);
const Transfer = mongoose.model("Transfer", TransferSchema);
const Adjustment = mongoose.model("Adjustment", AdjustmentSchema);
const Operation = mongoose.model("Operation", OperationSchema);


async function seed() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Receipt.deleteMany({});
        await Delivery.deleteMany({});
        await Transfer.deleteMany({});
        await Adjustment.deleteMany({});
        await Operation.deleteMany({});

        
        const admin = await User.create({
            name: "John Doe",
            email: "admin@example.com",
            password: "hashedpassword",
            role: "admin"
        });

        
        const products = await Product.insertMany([
            { adminId: admin._id, name: "Laptop", sku: "PROD001", category: "Electronics", unitPrice: 1200, quantity: 15, lowStockLimit: 5 },
            { adminId: admin._id, name: "Mouse", sku: "PROD002", category: "Electronics", unitPrice: 25, quantity: 50, lowStockLimit: 10 },
            { adminId: admin._id, name: "Office Chair", sku: "PROD003", category: "Furniture", unitPrice: 150, quantity: 10, lowStockLimit: 3 }
        ]);

      
        await Receipt.insertMany([
            { adminId: admin._id, productId: products[0]._id, reference: "RCPT001", supplier: "Tech Supplies Co.", quantity: 10, status: "Received", date: new Date("2025-11-21T12:00:00Z"), notes: "First batch of laptops" },
            { adminId: admin._id, productId: products[1]._id, reference: "RCPT002", supplier: "Gadget World", quantity: 50, status: "Received", date: new Date("2025-11-21T13:00:00Z"), notes: "Mouse stock" }
        ]);

        
        await Delivery.insertMany([
            { adminId: admin._id, productId: products[0]._id, reference: "DLV001", customer: "Alice Corp", quantity: 3, status: "Delivered", date: new Date("2025-11-22T09:00:00Z") },
            { adminId: admin._id, productId: products[1]._id, reference: "DLV002", customer: "Bob Industries", quantity: 5, status: "Pending", date: new Date("2025-11-22T10:00:00Z") }
        ]);

        
        await Transfer.insertMany([
            { adminId: admin._id, productId: products[0]._id, reference: "TRF001", fromLocation: "Warehouse A", toLocation: "Store B", quantity: 5, status: "Completed", date: new Date("2025-11-22T11:00:00Z") }
        ]);

        
        await Adjustment.insertMany([
            { adminId: admin._id, productId: products[2]._id, reference: "ADJ001", change: -1, reason: "Damaged chair", date: new Date("2025-11-22T12:00:00Z") }
        ]);

        
        await Operation.insertMany([
            { adminId: admin._id, reference: "RCPT001", type: "receipt", productId: products[0]._id, quantity: 10, status: "Received", date: new Date("2025-11-21T12:00:00Z") },
            { adminId: admin._id, reference: "DLV001", type: "delivery", productId: products[0]._id, quantity: 3, status: "Delivered", date: new Date("2025-11-22T09:00:00Z") }
        ]);

        console.log("Database seeded successfully!");
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    User,
    Product,
    Receipt,
    Delivery,
    Transfer,
    Adjustment,
    Operation
};
