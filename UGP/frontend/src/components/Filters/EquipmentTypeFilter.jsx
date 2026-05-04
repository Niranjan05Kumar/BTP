const EquipmentTypeFilter = ({ equipmentType, onChange }) => {
  return (
    <div className="filter-item">
      <label htmlFor="equipmentType">Equipment Type</label>
      <select
        id="equipmentType"
        value={equipmentType}
        onChange={(event) => onChange("equipmentType", event.target.value)}
      >
        <option value="all">All</option>
        <option value="dumper">Dumper</option>
        <option value="shovel">Shovel</option>
        <option value="dozer">Dozer</option>
        <option value="drill">Drill</option>
      </select>
    </div>
  );
};

export default EquipmentTypeFilter;
