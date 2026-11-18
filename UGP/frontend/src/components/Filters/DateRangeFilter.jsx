const DateRangeFilter = ({ startDate, endDate, onChange }) => {
  return (
    <div className="date-range-filter">
      <div className="filter-field">
        <label htmlFor="startDate">Start Date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(event) => onChange("startDate", event.target.value)}
        />
      </div>
      <div className="filter-field">
        <label htmlFor="endDate">End Date</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(event) => onChange("endDate", event.target.value)}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
