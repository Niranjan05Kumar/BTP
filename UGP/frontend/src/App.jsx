import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PageContainer from "./components/Layout/PageContainer.jsx";
import TopNav from "./components/Layout/TopNav.jsx";
import SubNav from "./components/Layout/SubNav.jsx";
import { FilterProvider } from "./context/FilterContext.jsx";

// 10 Analytical Modules
import MainDashboard from "./pages/MainDashboard.jsx";
import ProductionView from "./pages/ProductionView.jsx";
import EquipmentView from "./pages/EquipmentView.jsx";
import DowntimeReliabilityView from "./pages/DowntimeReliabilityView.jsx";
import HaulageView from "./pages/HaulageView.jsx";
import FleetMatchingView from "./pages/FleetMatchingView.jsx";
import MaterialStrippingView from "./pages/MaterialStrippingView.jsx";
import FuelCostView from "./pages/FuelCostView.jsx";
import InsightsView from "./pages/InsightsView.jsx";
import DataManagementView from "./pages/DataManagementView.jsx";

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
      <FilterProvider>
        <div className="app-shell">
          <TopNav themeMode={themeMode} setThemeMode={setThemeMode} />
          <SubNav />
          <PageContainer>
            <Routes>
              <Route path="/" element={<MainDashboard />} />
              <Route path="/production" element={<ProductionView />} />
              <Route path="/equipment" element={<EquipmentView />} />
              <Route path="/downtime" element={<DowntimeReliabilityView />} />
              <Route path="/haulage" element={<HaulageView />} />
              <Route path="/fleet-matching" element={<FleetMatchingView />} />
              <Route path="/materials" element={<MaterialStrippingView />} />
              <Route path="/fuel-cost" element={<FuelCostView />} />
              <Route path="/insights" element={<InsightsView />} />
              <Route path="/data" element={<DataManagementView />} />
            </Routes>
          </PageContainer>
        </div>
      </FilterProvider>
    </BrowserRouter>
  );
}

export default App;
