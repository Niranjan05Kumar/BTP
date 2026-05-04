import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import PageContainer from "./components/Layout/PageContainer.jsx";
import TopNav from "./components/Layout/TopNav.jsx";
import MainDashboard from "./pages/MainDashboard.jsx";
import EquipmentView from "./pages/EquipmentView.jsx";
import DataView from "./pages/DataView.jsx";

const THEME_KEY = "ugp-theme";

const resolveTheme = (mode) => {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
};

function App() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_KEY) || "system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.setAttribute("data-theme", resolveTheme(themeMode));
    };

    apply();
    localStorage.setItem(THEME_KEY, themeMode);

    if (themeMode !== "system") return undefined;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [themeMode]);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <TopNav themeMode={themeMode} setThemeMode={setThemeMode} />
        <PageContainer>
          <Routes>
            <Route path="/" element={<MainDashboard />} />
            <Route path="/equipment" element={<EquipmentView />} />
            <Route path="/data" element={<DataView />} />
          </Routes>
        </PageContainer>
      </div>
    </BrowserRouter>
  );
}

export default App;
