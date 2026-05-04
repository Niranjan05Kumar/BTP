const ShiftFilter = ({ shift, onChange }) => {
  return (
    <div className="filter-item">
      <label htmlFor="shift">Shift</label>
      <select id="shift" value={shift} onChange={(event) => onChange("shift", event.target.value)}>
        <option value="all">All</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>
    </div>
  );
};

export default ShiftFilter;
