const navItems = ["Home", "Posts", "Projects", "About"];

export function Header() {
  return (
    <header className="gh-header">
      <div className="container gh-header-inner">
        <div className="brand">N-Blog</div>
        <nav className="gh-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item} className="gh-nav-link" href="#" aria-label={item}>
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
