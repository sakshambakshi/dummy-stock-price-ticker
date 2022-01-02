import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";

import ReactApexChart from "react-apexcharts";

function App() {
  const [chartDataObj , setChartDataObj]= useState({series:[{data:[]}]}) 
  const [symbolName, setSymbolName] = useState("GME");
  const [currentStonk, setCurrentStonk] = useState({});
  const [prevPrice, setPrevPrice] = useState(-1);
  const [currentStonkPrice, setCurrentStonkPrice] = useState(-1);
  const [priceTime, setPriceTime] = useState(null);
  const directionEmoji = {
    priceUp: "up emoji",
    priceDown: "down emoji",
  };
  const direction = useMemo(() => {
    return prevPrice < currentStonkPrice
      ? "priceUp"
      : prevPrice > currentStonkPrice
      ? "priceDown"
      : "";
  }, [prevPrice, currentStonkPrice]);
  //testing
  const testingPrice = [145.23, 150.43, 143.24, 170.68, 220];
  function getStonkUrl() {
    return `http://localhost:8000/get/${symbolName}`;
  }

  function round(number){
    return number ? +number.toFixed(2) : null 
  }
  async function generateTheCandleStickChart(){
    debugger
    if( Object.keys(currentStonk).length == 0) return 
    const data = currentStonk?.chart?.result[0]?.timestamp;
    debugger
    const quote = currentStonk?.chart.result[0].indicators.quote[0]
    const chartData = data.map((_timestamp , index) => {
      return {
        x: new Date(_timestamp *1000),
        y:[ round( quote.open[index]) , round( quote.high[index]) , round( quote.low[index]) , round( quote.close[index])]
      }
    })
    setChartDataObj({series: [{data: chartData}]})
  }
  useEffect(() => {
    generateTheCandleStickChart()
  }, [currentStonk])
  async function getStonks() {
    const stonksResp = await fetch(getStonkUrl());
    const stonksDetails = await stonksResp.json();
    return stonksDetails;
  }
  function getRandomValue(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  let getPriceTimer;
  async function getLatestPrice() {
    const latestStonkDetails = await getCurrentStonkDetails();
    const stonkPrice =
      latestStonkDetails.chart?.result[0]?.meta?.regularMarketPrice;
    if (stonkPrice != undefined) {
      setCurrentStonkPrice((_prevPrice) => {
        setPrevPrice(_prevPrice);
        return stonkPrice;
      });
      // setPrevPrice(currentStonkPrice);
      // setCurrentStonkPrice(() => stonkPrice);
      setPriceTime(
        new Date(
          latestStonkDetails.chart?.result[0]?.meta?.regularMarketTime * 1000
        )
      );
      getPriceTimer = setTimeout(getLatestPrice, 5000);
      return stonkPrice;
    }
  }
  async function getCurrentStonkDetails() {
    const _stonk = await getStonks();
    setCurrentStonk(() => _stonk);
    return _stonk;
  }
  useEffect(() => {
    getCurrentStonkDetails();
    getLatestPrice();
    return () => {
      clearTimeout(getPriceTimer);
    };
  }, []);
  const state = {
    series: [
   
    ],
    options: {
      chart: {
        type: "candlestick",
        height: 350,
      },
      title: {
        text: "CandleStick Chart",
        align: "left",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    },
  };

  return (
    <div>
      <div className="ticker text-center">{symbolName}</div>
      <div className={["price", "text-center"].join(" ")}>
        {currentStonkPrice > -1
          ? `$${currentStonkPrice.toFixed(2)}`
          : "Loading"}

        {directionEmoji[direction]}
      </div>
      <div className="price-time text-center">
        {priceTime && priceTime.toLocaleTimeString()}
      </div>

      <div className="mixed-chart">
        <ReactApexChart
          options={state.options}
          series={chartDataObj.series}
          type="candlestick"
          height={350}
          width="100%"
        />
      </div>
    </div>
  );
}

export default App;
