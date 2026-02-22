function SegmentedTabs({ items, activeKey, onChange }) {
  return (
    <div className="tabs">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={["tab", isActive ? "active" : ""].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
