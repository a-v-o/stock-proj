import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { HashLoader } from "react-spinners";

const baseUrl = "https://www.alphavantage.co/query?function=";
const apiToken = import.meta.env.VITE_API_KEY;
const tokenSuffix = "&apikey=" + apiToken;

type Timestamp = {
  [key: string]: string;
};

type TimeSeries = Record<string, Timestamp>;

type MetaData = {
  "Meta Data": Record<string, string>;
};

export type AlphaVantageResponse = MetaData & {
  [key: string]: TimeSeries;
};

async function getPrice(symbol: string) {
  const endpoint = baseUrl + "GLOBAL_QUOTE&symbol=" + symbol + tokenSuffix;
  const result = await fetch(endpoint);
  return await result.json();
}

async function getDaily(symbol: string) {
  const endpoint = baseUrl + "TIME_SERIES_DAILY&symbol=" + symbol + tokenSuffix;
  const result = await fetch(endpoint);
  return await result.json();
}

export default function Stock() {
  const params = useParams();
  const symbol = params.symbol;
  const echartRef = useRef<HTMLDivElement>(null);

  const price = useQuery({
    queryKey: ["stockPrice", symbol],
    queryFn: async () => {
      const result: { "Global Quote": Record<string, string> } = await getPrice(
        symbol!
      );
      return Object.values(result)[0];
    },
    staleTime: Infinity,
  });

  const dailySeries = useQuery({
    queryKey: ["stockDaily", symbol],
    queryFn: async () => {
      const result: AlphaVantageResponse = await getDaily(symbol!);
      return Object.values(result)[1];
    },
    staleTime: Infinity,
  });

  const chartData = dailySeries.data;

  useEffect(() => {
    if (
      !echartRef.current ||
      !window.innerHeight ||
      !window.innerWidth ||
      !chartData
    )
      return;
    const intraDayIntervals = Object.keys(chartData);
    const formattedIntraDay = intraDayIntervals.map((interval) => {
      const ohlcv = Object.values(chartData[interval]);
      return [ohlcv[0], ohlcv[3], ohlcv[2], ohlcv[1]];
    });

    const myChart = echarts.init(echartRef.current);
    const options: echarts.EChartsOption = {
      title: {
        text: "24 hour time series chart",
      },
      tooltip: {},
      xAxis: {
        type: "category",
        data: intraDayIntervals.reverse(),
      },
      yAxis: {
        scale: true,
      },
      series: [
        {
          type: "candlestick",
          data: formattedIntraDay.reverse(),
          itemStyle: {
            color: "#14b143",
            color0: "#ef232a",
            borderColor: "#14b143",
            borderColor0: "#ef232a",
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          start: 50,
          end: 100,
        },
      ],
    };
    myChart.setOption(options);
    window.onresize = () => {
      myChart.resize();
    };
    return () => {
      myChart.dispose();
    };
  }, [chartData]);

  return (
    <div className="flex flex-col md:flex-row w-full justify-between items-center md:px-12">
      <div className="px-8 pt-12 self-start">
        <h2 className="uppercase font-bold text-lg">Stock Info (24h)</h2>
        <p>Symbol : {symbol}</p>
        {price.data ? (
          <div>
            <p>Opening price: ${price.data["02. open"]}</p>
            <p>High: ${price.data["03. high"]}</p>
            <p>Low: ${price.data["04. low"]}</p>
            <p>Current price: ${price.data["05. price"]}</p>
            <p>Volume: ${Number(price.data["06. volume"]).toLocaleString()}</p>
          </div>
        ) : null}
      </div>
      <div
        ref={echartRef}
        className="w-[90%] md:w-[800px] h-[500px] md:h-screen flex justify-center items-center"
      >
        {dailySeries.isPending ? <HashLoader /> : null}
      </div>
    </div>
  );
}
