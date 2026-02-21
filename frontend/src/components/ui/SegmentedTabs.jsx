function SegmentedTabs({ items, activeKey, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-zinc-200/80 bg-zinc-100/80 p-1 shadow-sm">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={[
              "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20",
              isActive
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
