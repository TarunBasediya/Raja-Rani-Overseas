import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [price, setPrice] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [shortMA, setShortMA] = useState(null);
  const [longMA, setLongMA] = useState(null);
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch real-time BTC price
  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );
      setPrice(parseFloat(response.data.price));
    } catch (error) {
      console.error("Error fetching BTC price:", error);
    }
  };

  // Function to fetch historical data for moving averages
  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50"
      );
      const prices = response.data.map((candle) => parseFloat(candle[4])); // Closing prices
      setHistoricalData(prices);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  // Function to calculate moving average
  const calculateMovingAverage = (data, period) => {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
    return sum / period;
  };

  // Function to generate trading signal
  const generateSignal = (shortMA, longMA) => {
    if (shortMA > longMA) return "BUY";
    if (shortMA < longMA) return "SELL";
    return "HOLD";
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPrice();
      await fetchHistoricalData();

      if (historicalData.length > 0) {
        const shortMAValue = calculateMovingAverage(historicalData, 5);
        const longMAValue = calculateMovingAverage(historicalData, 20);

        setShortMA(shortMAValue);
        setLongMA(longMAValue);
        setSignal(generateSignal(shortMAValue, longMAValue));
      }

      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 1 min
    return () => clearInterval(interval);
  }, [historicalData]);

  return (
    <div className="container">
      <h1 className="title">Algorithmic Trading Dashboard</h1>

      {loading ? (
        <p className="loading">Fetching market data...</p>
      ) : (
        <div className="data-box">
          <p>
            <strong>BTC Price:</strong>{" "}
            <span className="highlight">${price?.toFixed(2)}</span>
          </p>
          <p>
            <strong>Short MA (5):</strong> {shortMA?.toFixed(2) || "N/A"}
          </p>
          <p>
            <strong>Long MA (20):</strong> {longMA?.toFixed(2) || "N/A"}
          </p>
          <p className={`signal ${signal?.toLowerCase()}`}>
            <strong>Signal:</strong> {signal || "HOLD"}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
