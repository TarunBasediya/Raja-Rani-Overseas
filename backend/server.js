require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const serverless = require("serverless-http"); // Import serverless-http

const app = express();

app.use(cors());

// Function to calculate moving average
const calculateMovingAverage = (prices, period) => {
  if (prices.length < period) return null;
  const sum = prices
    .slice(-period)
    .reduce((acc, price) => acc + parseFloat(price), 0);
  return sum / period;
};

// Route to fetch historical prices & generate trading signals
app.get("/api/trading-signal", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=20"
    );
    const closingPrices = response.data.map((candle) => candle[4]);

    const shortMA = calculateMovingAverage(closingPrices, 5);
    const longMA = calculateMovingAverage(closingPrices, 20);

    let signal = "HOLD";
    if (shortMA > longMA) signal = "BUY";
    else if (shortMA < longMA) signal = "SELL";

    res.json({ shortMA, longMA, signal });
  } catch (error) {
    console.error("Binance API Fetch Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Export as a Vercel serverless function
module.exports = app;
module.exports.handler = serverless(app);
