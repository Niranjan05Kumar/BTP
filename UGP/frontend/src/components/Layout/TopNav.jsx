import { NavLink } from "react-router-dom";

const ThemeToggle = ({ themeMode, setThemeMode }) => (
  <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)} className="icon-btn" title="Theme">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
  </select>
);

const TopNav = ({ themeMode, setThemeMode }) => {
  return (
    <header className="top-nav">
      <div className="brand">
        <div className="logo" aria-hidden />
        <div>
          <h1>Surface Mining Dashboard</h1>
          <small>Operational insights by shift</small>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Primary">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
        <NavLink to="/equipment" className={({ isActive }) => (isActive ? "active" : "")}>Equipment</NavLink>
        <NavLink to="/data" className={({ isActive }) => (isActive ? "active" : "")}>Data</NavLink>
      </nav>

      <div className="top-actions">
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
      </div>
    </header>
  );
};

export default TopNav;
