import DateRangeFilter from "./DateRangeFilter.jsx";
import ShiftFilter from "./ShiftFilter.jsx";
import EquipmentTypeFilter from "./EquipmentTypeFilter.jsx";
import MaterialFilter from "./MaterialFilter.jsx";
import { useFilters } from "../../context/FilterContext.jsx";

const FiltersBar = ({ showMaterial = true, showEquipment = true, customExportLabel = "Export CSV" }) => {
  const { filters, updateFilter, resetFilters, triggerExport } = useFilters();

  return (
    <div className="filters-bar">
      <div className="control">
        <DateRangeFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={updateFilter}
        />
      </div>

      <div className="control">
        <ShiftFilter shift={filters.shift} onChange={updateFilter} />
      </div>

      {showEquipment && (
        <div className="control">
          <EquipmentTypeFilter
            equipmentType={filters.equipmentType}
            onChange={updateFilter}
          />
        </div>
      )}

      {showMaterial && (
        <div className="control">
          <MaterialFilter
            materialCategory={filters.materialCategory}
            onChange={updateFilter}
          />
        </div>
      )}

      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          className="icon-btn text-btn"
          onClick={resetFilters}
          title="Reset to default 30-day range and all filters"
        >
          Reset Filters
        </button>

        <button
          type="button"
          className="export-btn"
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
