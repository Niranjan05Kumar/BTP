import DateRangeFilter from "./DateRangeFilter.jsx";
import ShiftFilter from "./ShiftFilter.jsx";
import EquipmentTypeFilter from "./EquipmentTypeFilter.jsx";
import MaterialFilter from "./MaterialFilter.jsx";
import { useFilters } from "../../context/FilterContext.jsx";

const FiltersBar = ({ showMaterial = true, showEquipment = true, customExportLabel = "Export CSV" }) => {
  const { filters, updateFilter, resetFilters, triggerExport } = useFilters();

  return (
    <div className="filters-bar">
      <div className="filters-inputs-grid">
        <DateRangeFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={updateFilter}
        />

        <div className="filters-selectors-row">
          <ShiftFilter shift={filters.shift} onChange={updateFilter} />

          {showEquipment && (
            <EquipmentTypeFilter
              equipmentType={filters.equipmentType}
              onChange={updateFilter}
            />
          )}

          {showMaterial && (
            <MaterialFilter
              materialCategory={filters.materialCategory}
              onChange={updateFilter}
            />
          )}
        </div>
      </div>

      <div className="filters-actions-row">
        <button
          type="button"
          className="icon-btn text-btn filter-reset-btn"
          onClick={resetFilters}
          title="Reset to default 30-day range and all filters"
        >
          Reset Filters
        </button>

        <button
          type="button"
          className="export-btn filter-export-btn"
          onClick={() => triggerExport()}
          title="Download operational dataset as CSV"
        >
          <span style={{ fontSize: "14px" }}>📥</span> {customExportLabel}
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;
