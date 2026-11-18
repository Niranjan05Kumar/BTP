/**
 * Master Data Catalog: Mines, Materials, and 16-Unit Equipment Fleet
 */

export const defaultMine = {
  mineId: "M-SIM-01",
  name: "Central Surface Mining Operation",
  mineralType: "Coal",
  location: {
    state: "Madhya Pradesh",
    country: "India",
  },
  scheduledShiftHours: 8.0,
  shiftsPerDay: 3,
};

export const defaultMaterials = [
  {
    materialId: "COAL_ROM",
    name: "Run of Mine Coal",
    category: "Mineral",
    densityInSitu: 1.35, // t/m³
    swellFactor: 1.25,
    defaultUnit: "tonnes",
  },
  {
    materialId: "OB_SANDSTONE",
    name: "Overburden Sandstone",
    category: "Overburden",
    densityInSitu: 2.40, // t/m³
    swellFactor: 1.35,
    defaultUnit: "BCM",
  },
  {
    materialId: "OB_SHALE",
    name: "Overburden Carbonaceous Shale",
    category: "Overburden",
    densityInSitu: 2.10, // t/m³
    swellFactor: 1.30,
    defaultUnit: "BCM",
  },
  {
    materialId: "TOPSOIL",
    name: "Topsoil Stratum",
    category: "Topsoil",
    densityInSitu: 1.50, // t/m³
    swellFactor: 1.15,
    defaultUnit: "BCM",
  },
  {
    materialId: "IRON_ORE_HEM",
    name: "Hematite Iron Ore",
    category: "Ore",
    densityInSitu: 3.10, // t/m³
    swellFactor: 1.40,
    defaultUnit: "tonnes",
  },
  {
    materialId: "LIMESTONE_IND",
    name: "Industrial Limestone",
    category: "Mineral",
    densityInSitu: 2.50, // t/m³
    swellFactor: 1.30,
    defaultUnit: "tonnes",
  },
];

/**
 * Verified 16-Unit Surface Mining Equipment Fleet
 * 3 Shovels + 1 Loader + 7 Dumpers + 2 Dozers + 1 Drill + 1 Grader + 1 Water Tanker = 16 units
 */
export const equipmentFleet = [
  // 3 Primary Shovels / Excavators
  {
    equipmentId: "SH-01",
    type: "shovel",
    makeModel: "Komatsu PC3000-11 Face Shovel",
    capacityTon: 35,
    bucketCapacityM3: 12.0,
    ratedPowerHp: 1260,
    status: "active",
    notes: "Primary Coal Face Excavator (dedicated to Coal Bench)",
  },
  {
    equipmentId: "SH-02",
    type: "shovel",
    makeModel: "Caterpillar 6020B Hydraulic Excavator",
    capacityTon: 25,
    bucketCapacityM3: 8.5,
    ratedPowerHp: 1043,
    status: "active",
    notes: "Upper Overburden Sandstone Excavator",
  },
  {
    equipmentId: "SH-03",
    type: "shovel",
    makeModel: "Tata Hitachi EX1200V",
    capacityTon: 18,
    bucketCapacityM3: 6.5,
    ratedPowerHp: 760,
    status: "active",
    notes: "Lower Overburden Shale Excavator",
  },

  // 1 Wheel Loader
  {
    equipmentId: "WL-01",
    type: "wheel_loader",
    makeModel: "Caterpillar 988K Wheel Loader",
    capacityTon: 15,
    bucketCapacityM3: 5.5,
    ratedPowerHp: 580,
    status: "active",
    notes: "Stockpile Loading, Blasting Clean-Up and Rail Siding",
  },

  // 7 Dumpers / Haul Trucks
  {
    equipmentId: "DT-101",
    type: "dumper",
    makeModel: "Caterpillar 777E Off-Highway Truck",
    capacityTon: 60,
    bucketCapacityM3: 40.0,
    ratedPowerHp: 1004,
    status: "active",
    notes: "Paired with SH-01 (Coal Bench)",
  },
  {
    equipmentId: "DT-102",
    type: "dumper",
    makeModel: "Caterpillar 777E Off-Highway Truck",
    capacityTon: 60,
    bucketCapacityM3: 40.0,
    ratedPowerHp: 1004,
    status: "active",
    notes: "Paired with SH-01 (Coal Bench)",
  },
  {
    equipmentId: "DT-103",
    type: "dumper",
    makeModel: "Komatsu HD465-8 Haul Truck",
    capacityTon: 55,
    bucketCapacityM3: 34.0,
    ratedPowerHp: 724,
    status: "active",
    notes: "Swing Truck (SH-01 / SH-02)",
  },
  {
    equipmentId: "DT-104",
    type: "dumper",
    makeModel: "Komatsu HD465-8 Haul Truck",
    capacityTon: 55,
    bucketCapacityM3: 34.0,
    ratedPowerHp: 724,
    status: "active",
    notes: "Paired with SH-02 (Overburden Bench)",
  },
  {
    equipmentId: "DT-105",
    type: "dumper",
    makeModel: "BEML BH60M Haul Truck",
    capacityTon: 50,
    bucketCapacityM3: 32.0,
    ratedPowerHp: 650,
    status: "active",
    notes: "Paired with SH-02 (Overburden Bench)",
  },
  {
    equipmentId: "DT-106",
    type: "dumper",
    makeModel: "BEML BH60M Haul Truck",
    capacityTon: 50,
    bucketCapacityM3: 32.0,
    ratedPowerHp: 650,
    status: "active",
    notes: "Paired with SH-03 (Overburden Bench)",
  },
  {
    equipmentId: "DT-107",
    type: "dumper",
    makeModel: "BEML BH60M Haul Truck",
    capacityTon: 50,
    bucketCapacityM3: 32.0,
    ratedPowerHp: 650,
    status: "active",
    notes: "Paired with SH-03 (Overburden Bench)",
  },

  // 2 Heavy Crawler Bulldozers
  {
    equipmentId: "DZ-01",
    type: "dozer",
    makeModel: "Komatsu D375A-8 Crawler Dozer",
    capacityTon: 48, // Operating Weight
    bucketCapacityM3: 0,
    ratedPowerHp: 610,
    status: "active",
    notes: "Bench leveling, shovel face cleanup, ripper operations",
  },
  {
    equipmentId: "DZ-02",
    type: "dozer",
    makeModel: "Caterpillar D8T Crawler Dozer",
    capacityTon: 40,
    bucketCapacityM3: 0,
    ratedPowerHp: 350,
    status: "active",
    notes: "Waste spoil dump crest maintenance & dozing",
  },

  // 1 Rotary Blast-Hole Drill Rig
  {
    equipmentId: "DR-01",
    type: "drill",
    makeModel: "Epiroc Pit Viper 271 Rotary Drill",
    capacityTon: 85,
    bucketCapacityM3: 0,
    ratedPowerHp: 800,
    status: "active",
    notes: "250mm diameter blast hole drilling on Overburden benches",
  },

  // 1 Motor Grader
  {
    equipmentId: "MG-01",
    type: "motor_grader",
    makeModel: "Caterpillar 16M3 Motor Grader",
    capacityTon: 32,
    bucketCapacityM3: 0,
    ratedPowerHp: 290,
    status: "active",
    notes: "Main haul road maintenance, grading, crowning and spillage removal",
  },

  // 1 Water Tanker
  {
    equipmentId: "WT-01",
    type: "water_tanker",
    makeModel: "BEML WT28 Heavy Water Sprinkler (28kL)",
    capacityTon: 38,
    bucketCapacityM3: 0,
    ratedPowerHp: 320,
    status: "active",
    notes: "Haul road and bench dust suppression",
  },
];

