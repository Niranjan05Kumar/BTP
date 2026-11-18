const ThemeToggle = ({ themeMode, setThemeMode }) => (
  <select
    value={themeMode}
    onChange={(e) => setThemeMode(e.target.value)}
    className="icon-btn theme-select"
    title="Select Theme"
    aria-label="Theme mode"
  >
    <option value="light">☀️ Light</option>
    <option value="dark">🌙 Dark</option>
    <option value="system">💻 System</option>
  </select>
);

const TopNav = ({ themeMode, setThemeMode }) => {
  return (
    <header className="top-nav">
      <div className="brand">
        <div className="logo" aria-hidden />
        <div>
          <h1>Surface Mining Dashboard</h1>
          <small>Production, Fleet Availability & Operational Decision Support</small>
        </div>
      </div>

      <div className="top-actions">
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
      </div>
    </header>
  );
};

export default TopNav;
