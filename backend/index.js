require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionModel } = require("./model/PositionModel");
const { OrdersModel } = require("./model/OrdersModel");

const authRoute = require("./AuthRoute");

const app = express();
const PORT = process.env.PORT || 3001;
const url = process.env.MONGO_URL;

// CORS config for CRA frontend
app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:3002" ], // CRA dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

// Auth routes
app.use("/", authRoute);



// Example endpoints (unchanged from your code)
app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  const allPositions = await PositionModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  const { name, qty, price, mode } = req.body;

  try {
    await OrdersModel.findOneAndUpdate(
      { name, mode },
      { $inc: { qty: qty }, $set: { price: price } },
      { upsert: true, new: true }
    );

    const existing = await HoldingsModel.findOne({ name });

    if (mode === "BUY") {
      if (existing) {
        const totalQty = existing.qty + qty;
        const newAvg =
          (existing.qty * existing.avg + qty * price) / totalQty;

        existing.qty = totalQty;
        existing.avg = newAvg;
        existing.price = price;
        await existing.save();
      } else {
        await HoldingsModel.create({
          name,
          qty,
          avg: price,
          price,
          net: "+0%",
          day: "+0%",
        });
      }
    }

    if (mode === "SELL") {
      if (!existing || existing.qty < qty) {
        return res.status(400).send("Not enough stock to sell");
      }

      existing.qty -= qty;

      if (existing.qty === 0) {
        await HoldingsModel.deleteOne({ name });
      } else {
        await existing.save();
      }
    }

    res.send("Order and Holdings updated successfully!");
  } catch (err) {
    console.error("Order update error:", err);
    res.status(500).send("Server error");
  }
});

app.get("/allOrders", async (req, res) => {
  const allOrders = await OrdersModel.find({});
  res.send(allOrders);
});

// Connect to MongoDB & start server
mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
