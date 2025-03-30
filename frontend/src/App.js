import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        const response = await axios.get(
          "https://backend-omega-coral.vercel.app/api/trading-signal"
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingData();
    const interval = setInterval(fetchTradingData, 60000); // Refresh every 1 min
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="container">
      <h1>Algorithmic Trading Dashboard</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="data-box">
          <p>
            <strong>Short MA:</strong> {data.shortMA.toFixed(2)}
          </p>
          <p>
            <strong>Long MA:</strong> {data.longMA.toFixed(2)}
          </p>
          <p className={`signal ${data.signal}`}>
            <strong>Signal:</strong> {data.signal}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
