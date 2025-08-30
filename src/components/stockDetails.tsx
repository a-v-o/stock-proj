

export default function StockDetails({ symbol }: { symbol: string }) {
  return (
    <div>
      <p>{symbol}</p>
      {/* <p>{price.data.c}</p> */}
    </div>
  );
}
