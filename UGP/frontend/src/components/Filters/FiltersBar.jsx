import DateRangeFilter from "./DateRangeFilter.jsx";
import ShiftFilter from "./ShiftFilter.jsx";
import EquipmentTypeFilter from "./EquipmentTypeFilter.jsx";

const FiltersBar = ({ startDate, endDate, shift, equipmentType, onChange }) => {
  return (
    <div className="filters-bar">
      <div className="control">
        <DateRangeFilter startDate={startDate} endDate={endDate} onChange={onChange} />
      </div>

      <div className="control">
        <ShiftFilter shift={shift} onChange={onChange} />
      </div>

      <div className="control">
        <EquipmentTypeFilter equipmentType={equipmentType} onChange={onChange} />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button className="icon-btn">Export</button>
        <div className="muted" style={{ alignSelf: "center" }}>Live • Updated 2m ago</div>
      </div>
    </div>
  );
};

export default FiltersBar;
