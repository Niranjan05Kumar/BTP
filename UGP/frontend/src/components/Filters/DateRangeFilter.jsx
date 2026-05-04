const DateRangeFilter = ({ startDate, endDate, onChange }) => {
  return (
    <div className="filter-item">
      <label htmlFor="startDate">Start Date</label>
      <input
        id="startDate"
        type="date"
        value={startDate}
        onChange={(event) => onChange("startDate", event.target.value)}
      />
      <label htmlFor="endDate">End Date</label>
      <input
        id="endDate"
        type="date"
        value={endDate}
        onChange={(event) => onChange("endDate", event.target.value)}
      />
    </div>
  );
};

export default DateRangeFilter;
