import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { path: "/", label: "Overview" },
  { path: "/production", label: "Production" },
  { path: "/equipment", label: "Equipment" },
  { path: "/downtime", label: "Downtime & Reliability" },
  { path: "/haulage", label: "Haulage Cycles" },
  { path: "/fleet-matching", label: "Shovel-Dumper Matching" },
  { path: "/materials", label: "Material & Stripping" },
  { path: "/fuel-cost", label: "Fuel & Cost" },
  { path: "/insights", label: "Operational Insights" },
  { path: "/data", label: "Management & Data" },
];

const SubNav = () => (
  <nav className="sub-nav" aria-label="Secondary Navigation">
    {NAV_LINKS.map((link) => (
      <NavLink
        key={link.path}
        to={link.path}
        end={link.path === "/"}
        className={({ isActive }) => (isActive ? "sub-nav-active" : "")}
      >
        {link.label}
      </NavLink>
    ))}
  </nav>
);

export default SubNav;
