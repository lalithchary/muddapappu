export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        About <span className="text-deal-500">SastaDeal</span>
      </h1>
      <p className="mt-4 text-ink-300">
        SastaDeal is a curated deals aggregator for Indian online shoppers. We track
        live prices and promo codes across Amazon, Flipkart, Myntra, Ajio, Swiggy,
        Zomato, Zepto, and BigBasket — so you never miss a good deal.
      </p>
      <div className="card mt-6 p-6">
        <h2 className="mb-3 text-lg font-semibold">How it works</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-ink-300">
          <li>We pull live prices from retailer APIs and affiliate networks.</li>
          <li>Each deal is tagged <span className="text-emerald-400">Active</span>, <span className="text-amber-400">Ending Soon</span>, or <span className="text-ink-500">Expired</span>.</li>
          <li>You can filter by store, price, discount, and category.</li>
          <li>Clicking a deal takes you to the retailer via an affiliate link.</li>
        </ol>
      </div>
      <p className="mt-6 text-xs text-ink-600">
        Disclaimer: Prices and availability are subject to change. We are not
        responsible for retailer pricing errors. Affiliate links may earn us a
        small commission at no extra cost to you.
      </p>
    </div>
  );
}