import { useQuery } from "@tanstack/react-query";
import "./App.css";
import StockTable from "./components/stockTable";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LuLoader } from "react-icons/lu";
import { HashLoader } from "react-spinners";

const baseUrl = "https://www.alphavantage.co/query?function=";
const apiToken = import.meta.env.VITE_API_KEY;
const tokenSuffix = "&apikey=" + apiToken;

async function getLosersGainers() {
  const endpoint = baseUrl + "TOP_GAINERS_LOSERS" + tokenSuffix;
  const result = await fetch(endpoint);
  return await result.json();
}

async function getTokens(keywords: string) {
  const endpoint = baseUrl + "SYMBOL_SEARCH&keywords=" + keywords + tokenSuffix;
  const result = await fetch(endpoint);
  return await result.json();
}

function App() {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const topGainersLosers = useQuery({
    queryKey: ["gainersLosers"],
    queryFn: async () => {
      const result: {
        metadata: string;
        last_updated: string;
        most_actively_traded: Record<string, string>[];
        top_gainers: Record<string, string>[];
        top_losers: Record<string, string>[];
      } = await getLosersGainers();

      return [
        result.most_actively_traded,
        result.top_gainers,
        result.top_losers,
      ];
    },
    staleTime: Infinity,
  });

  const matchedTokens = useQuery({
    queryKey: ["matchedTokens", keyword],
    queryFn: async () => {
      const result: { bestMatches: Record<string, string>[] } = await getTokens(
        keyword
      );
      return result.bestMatches;
    },
    enabled: false,
  });

  const mostTraded: Record<string, string>[] = topGainersLosers.data
    ? topGainersLosers.data[0]
    : [];
  const topGainers: Record<string, string>[] = topGainersLosers.data
    ? topGainersLosers.data[1]
    : [];
  const topLosers: Record<string, string>[] = topGainersLosers.data
    ? topGainersLosers.data[2]
    : [];

  useEffect(() => {
    window.onload = () => {
      setIsLoading(false);
    };
  });

  return (
    <div className="flex w-full p-6 justify-center items-center flex-col gap-5">
      {(isLoading || topGainersLosers.isFetching) && (
        <div className="absolute top-0 left-0 w-screen h-screen flex justify-center items-center">
          <HashLoader />
        </div>
      )}

      <div className="text-center">
        <h1>Stock Price Checker</h1>
        <h2>Welcome to my demo website which shows the prices of stocks.</h2>
        <p>
          This website shows the price, volume and gain or loss of the most
          actively traded or top losing and top gaining stocks.
        </p>
        <p>
          You can also search for a specific stock or company and get 24 hour
          information on it as well as a candlestick chart showing open, high,
          low and closing prices
        </p>
        <p>
          As this is a demo, the API in use is a free version and is only
          limited to 25 requests per day. Also, as this wasn't tested
          extensively, I would recommend searching for a stock such as AAPL or
          Apple as I have tested this.
        </p>
        <p>Thank you for visiting!</p>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex justify-between gap-2">
          <input
            type="text"
            id="search"
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            placeholder="Search for a stock"
            className="border-[1px] border-gray-500/50 grow rounded-lg p-1 px-2 outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-500/50 shadow-sm"
          />
          <button
            onClick={() => {
              if (keyword == "") return;
              matchedTokens.refetch();
            }}
            className="bg-blue-950 hover:bg-blue-950/85 text-white rounded-lg px-4 cursor-pointer"
          >
            {!matchedTokens.isFetching ? (
              "Search"
            ) : (
              <div className="animate-spin">
                <LuLoader />
              </div>
            )}
          </button>
        </div>

        <div className="w-full h-full shadow bg-neutral-200">
          {matchedTokens.data?.map((token) => {
            return (
              <Link
                to={`/stock/${token["1. symbol"]}`}
                key={token["1. symbol"]}
                className="flex justify-between p-2 bg-white hover:bg-neutral-100"
              >
                <p>{token["1. symbol"]}</p>
                <p>{token["2. symbol"]}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="w-full flex flex-col gap-5">
        <h1>Most Actively Traded</h1>
        <StockTable stockData={mostTraded} />

        <h1>Top Gainers</h1>
        <StockTable stockData={topGainers} />

        <h1>Top Losers</h1>
        <StockTable stockData={topLosers} />
      </div>
    </div>
  );
}

export default App;
