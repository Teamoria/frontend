import Brand from "../Brand.jsx";

const navItems = [
  ["home", "Home"],
  ["product", "Product"],
  ["features", "Features"],
  ["solutions", "Solutions"],
  ["pricing", "Pricing"]
];

export default function MarketingHeader({ page = "home" }) {
  return (
    <header className="topbar marketing-topbar">
      <Brand compact />
      <nav>
        {navItems.map(([key, label]) => (
          <a className={page === key ? "active" : ""} href={key === "home" ? "#/" : `#/${key}`} key={key}>
            {label}
          </a>
        ))}
      </nav>
      <div className="topbar-actions">
        <a href="#/signin">Log in</a>
        <a className="small-primary" href="#/signup">Get Started</a>
      </div>
    </header>
  );
}
