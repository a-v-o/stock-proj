export default function StockTable({
  stockData,
}: {
  stockData: Record<string, string>[];
}) {
  return (
    <div className="w-full">
      <table className="w-full overflow-auto border-collapse text-sm md:text-base">
        <thead className="text-left">
          <tr>
            <th>Ticker</th>
            <th>Price</th>
            <th>Change amount</th>
            <th>Change percentage</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {stockData?.map((stock) => {
            return (
              <tr key={stock.ticker}>
                <td>{stock.ticker}</td>
                <td>{stock.price}</td>
                <td
                  className={
                    Number(stock.change_amount) < 0
                      ? "text-red-700"
                      : "text-green-700"
                  }
                >
                  {stock.change_amount}
                </td>
                <td
                  className={
                    Number(stock.change_amount) < 0
                      ? "text-red-700"
                      : "text-green-700"
                  }
                >
                  {stock.change_percentage}
                </td>
                <td>${Number(stock.volume).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
