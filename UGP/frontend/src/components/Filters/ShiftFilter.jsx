const ShiftFilter = ({ shift, onChange }) => {
  return (
    <div className="filter-field">
      <label htmlFor="shift">Shift</label>
      <select id="shift" value={shift} onChange={(event) => onChange("shift", event.target.value)}>
        <option value="all">All Shifts</option>
        <option value="A">Shift A (Morning)</option>
        <option value="B">Shift B (Evening)</option>
        <option value="C">Shift C (Night)</option>
      </select>
    </div>
  );
};

export default ShiftFilter;
