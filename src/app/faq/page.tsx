export default function FAQPage() {
  const faqs = [
    {
      q: 'How often are prices updated?',
      a: 'Hot categories are synced every few hours. Prices are verified via retailer APIs where available; otherwise they are refreshed on ingest. A deal whose price has not been verified recently is automatically tagged Expired.',
    },
    {
      q: 'Are the links safe to click?',
      a: 'Yes. Every link points to the official retailer product page. Some links include an affiliate tag so we earn a small commission when you buy — this costs you nothing extra.',
    },
    {
      q: 'Do I need an account?',
      a: 'No. SastaDeal is free and accountless. You can browse, filter, and click deals without signing up.',
    },
    {
      q: 'How do I report an expired deal?',
      a: 'Send us a note via the contact page. Our ingest pipeline will re-verify and retire stale deals automatically.',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">FAQ</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="card group p-5">
            <summary className="cursor-pointer list-none text-sm font-semibold">
              <span className="flex items-center justify-between">
                {f.q}
                <span className="text-ink-500 transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}