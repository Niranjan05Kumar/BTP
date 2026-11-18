const MaterialFilter = ({ materialCategory, onChange }) => {
  return (
    <div className="filter-item">
      <label htmlFor="materialCategory">Material</label>
      <select
        id="materialCategory"
        value={materialCategory || "all"}
        onChange={(event) => onChange("materialCategory", event.target.value)}
      >
        <option value="all">All Materials</option>
        <option value="Mineral">Mineral (Coal / Ore)</option>
        <option value="Overburden">Overburden (Sandstone/Shale)</option>
        <option value="Topsoil">Topsoil Stratum</option>
      </select>
    </div>
  );
};

export default MaterialFilter;

