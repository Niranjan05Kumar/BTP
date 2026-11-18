const EquipmentTypeFilter = ({ equipmentType, onChange }) => {
  return (
    <div className="filter-field">
      <label htmlFor="equipmentType">Equipment Type</label>
      <select
        id="equipmentType"
        value={equipmentType}
        onChange={(event) => onChange("equipmentType", event.target.value)}
      >
        <option value="all">All Fleet Types</option>
        <option value="dumper">Dumpers / Haul Trucks</option>
        <option value="shovel">Excavators & Shovels</option>
        <option value="wheel_loader">Wheel Loaders</option>
        <option value="dozer">Crawler Bulldozers</option>
        <option value="drill">Blast-Hole Drills</option>
        <option value="motor_grader">Motor Graders</option>
        <option value="water_tanker">Water Tankers</option>
      </select>
    </div>
  );
};

export default EquipmentTypeFilter;
