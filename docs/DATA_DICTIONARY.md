# Data Dictionary: Surface Mining Dashboard

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 1.0  
**Phase:** Phase 1 — Data Architecture & Specifications  

---

## 1. Overview & Conventions

This Data Dictionary defines every data attribute across all MongoDB collections in the Surface Mining Dashboard.

### Measurement Units & Conventions:
- **Mass / Weight:** Tonnes (metric tons, $1\text{ t} = 1000\text{ kg}$).
- **Volume:** Bank Cubic Meters (BCM, in-situ rock volume) or Loose Cubic Meters (LCM).
- **Time:** Hours (decimal hours, e.g., $1.5\text{ h} = 90\text{ minutes}$) for shift-level records; Minutes for cycle-time records.
- **Fuel:** Liters (L).
- **Monetary Currency:** Indian Rupees (INR, ₹).
- **Power:** Horsepower (HP) or Kilowatts (kW).

---

## 2. Collection Attributes

### 2.1 Collection: `mines` (Master)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `mineId` | String | Yes | — | Unique, Uppercase | — | Unique mining lease identifier (e.g., `M-JAYANT-01`). |
| `name` | String | Yes | — | — | — | Full commercial mine name (e.g., `Jayant Opencast Project`). |
| `mineralType` | String | Yes | — | `Coal`, `Iron Ore`, `Bauxite`, `Limestone`, `Copper`, `Multi-Mineral` | — | Primary commodity extracted. |
| `location.state` | String | Yes | — | — | — | Indian state or province (e.g., `Madhya Pradesh`). |
| `location.country`| String | No | `"India"` | — | — | Country of operation. |
| `scheduledShiftHours`| Number | No | `8.0` | `4.0 - 12.0` | hours | Standard duration of a single working shift. |
| `shiftsPerDay` | Number | No | `3` | `1 - 4` | count | Total working shifts per 24-hour production day. |

---

### 2.2 Collection: `materials` (Master)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `materialId` | String | Yes | — | Unique (e.g., `COAL_ROM`, `OB_SANDSTONE`) | — | Unique code identifying rock or mineral type. |
| `name` | String | Yes | — | — | — | Descriptive name (e.g., `Run of Mine Coal`, `Overburden Sandstone`). |
| `category` | String | Yes | — | `Ore`, `Mineral`, `Overburden`, `Waste`, `Topsoil` | — | Stratigraphic/commercial classification. |
| `densityInSitu` | Number | Yes | — | `0.5 - 5.0` | $\text{t/m}^3$ | In-situ (bank) bulk density of solid rock. |
| `swellFactor` | Number | Yes | `1.25` | `1.0 - 2.0` | ratio | Volumetric expansion ratio upon blasting ($V_{\text{loose}} / V_{\text{bank}}$). |
| `defaultUnit` | String | No | `"tonnes"` | `tonnes`, `BCM` | — | Primary reporting unit. |

---

### 2.3 Collection: `equipment` (Master)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `equipmentId` | String | Yes | — | Unique (e.g., `D101`, `SH201`) | — | Unique asset tag. |
| `type` | String | Yes | — | `dumper`, `shovel`, `wheel_loader`, `dozer`, `drill`, `motor_grader`, `water_tanker` | — | Fleet category. |
| `makeModel` | String | No | `""` | — | — | Manufacturer & model (e.g., `Caterpillar 777E`, `Komatsu PC2000`). |
| `capacityTon` | Number | Yes | — | $\ge 0$ | tonnes | Rated dumper payload or operating weight of mobile plant. |
| `bucketCapacityM3` | Number | No | `0` | $\ge 0$ | $\text{m}^3$ | Bucket/dipper volume for shovels and wheel loaders. |
| `ratedPowerHp` | Number | No | `0` | $\ge 0$ | HP | Diesel engine or electric motor power rating. |
| `status` | String | Yes | `"active"` | `active`, `standby`, `under_maintenance`, `decommissioned` | — | Operational availability readiness state. |
| `notes` | String | No | `""` | — | — | Operational or maintenance logs. |

---

### 2.4 Collection: `shiftequipmentrecords` (Operational Fact)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `date` | Date | Yes | — | Valid ISO Date | — | Calendar date of the working shift (normalized to 00:00:00 UTC). |
| `shiftCode` | String | Yes | — | `A`, `B`, `C` | — | Shift designation (`A` = Morning, `B` = Afternoon, `C` = Night). |
| `equipmentId` | String | Yes | — | References `Equipment.equipmentId` | — | Asset ID. |
| `equipmentType` | String | Yes | — | Equipment type enum | — | Redundant type cache for high-speed indexing without joins. |
| `materialId` | String | No | `"COAL"` | References `Material.materialId` | — | Predominant material hauled or excavated during shift. |
| `materialCategory` | String | No | `"Mineral"`| `Ore`, `Mineral`, `Overburden`, `Waste`, `Topsoil`, `Support` | — | Classification for rapid stripping ratio queries. |
| `materialTonnage` | Number | Yes | `0` | $\ge 0$ | tonnes | Extracted or hauled tonnage. |
| `volumeBcm` | Number | No | `0` | $\ge 0$ | BCM | Calculated in-situ volume ($= \text{Tonnage} / \text{densityInSitu}$). |
| `trips` | Number | Yes | `0` | $\ge 0$ | count | Total completed haulage trips during shift. |
| `operatingHours` | Number | Yes | `0` | `0.0 - 8.0` | hours | Time actively working ($T_o$). |
| `idleHours` | Number | Yes | `0` | `0.0 - 8.0` | hours | Time mechanically ready but halted by operational delay ($T_i$). |
| `maintenanceHours` | Number | Yes | `0` | `0.0 - 8.0` | hours | Time lost to scheduled service or breakdown repair ($T_m$). |
| `primaryDowntimeReason`| String | No | `"None"` | — | — | Most significant delay or maintenance description. |
| `fuelLiters` | Number | No | `0` | $\ge 0$ | liters | Diesel fuel consumed during shift. |
| `operatingCost` | Number | No | `0` | $\ge 0$ | INR (₹) | Total variable shift cost (fuel + labor + consumables). |
| `dataSource` | String | No | `"synthetic_simulation"` | — | — | Origin of record (`synthetic_simulation`). |

*Constraint Rule:* For every record, $\text{operatingHours} + \text{idleHours} + \text{maintenanceHours} = 8.0\text{ h} \pm 0.05\text{ h}$.

---

### 2.5 Collection: `haulagecyclerecords` (Operational Fact)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `date` | Date | Yes | — | Valid ISO Date | — | Date of haulage event. |
| `shiftCode` | String | Yes | — | `A`, `B`, `C` | — | Shift code. |
| `dumperId` | String | Yes | — | Dumper Asset ID | — | Haul truck asset identifier. |
| `shovelId` | String | Yes | — | Shovel Asset ID | — | Loading excavator asset identifier. |
| `materialId` | String | Yes | — | Material code | — | Material hauled. |
| `payloadTonnage` | Number | Yes | — | $\ge 0$ | tonnes | Weighed or estimated payload for this trip. |
| `queueWaitMinutes` | Number | Yes | `0` | $\ge 0$ | minutes | Time spent waiting in queue for shovel ($t_w$). |
| `spotLoadMinutes` | Number | Yes | `0` | $\ge 0$ | minutes | Time to spot and receive loading passes ($t_l$). |
| `loadedTravelMinutes`| Number | Yes | `0` | $\ge 0$ | minutes | Transit time from bench to dump ($t_h$). |
| `spotDumpMinutes` | Number | Yes | `0` | $\ge 0$ | minutes | Maneuver and dumping time ($t_d$). |
| `emptyReturnMinutes` | Number | Yes | `0` | $\ge 0$ | minutes | Transit time back to bench ($t_r$). |
| `totalCycleMinutes` | Number | Yes | — | $\ge 0$ | minutes | Sum of cycle components ($= t_w + t_l + t_h + t_d + t_r$). |

---

### 2.6 Collection: `downtimeevents` (Operational Event)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `date` | Date | Yes | — | Valid ISO Date | — | Date of occurrence. |
| `shiftCode` | String | Yes | — | `A`, `B`, `C` | — | Shift code. |
| `equipmentId` | String | Yes | — | Asset ID | — | Affected equipment unit. |
| `equipmentType` | String | Yes | — | Equipment type | — | Equipment category. |
| `category` | String | Yes | — | `Planned Maintenance`, `Unplanned Breakdown`, `Operational Delay` | — | High-level delay classification. |
| `subSystem` | String | No | `"General"` | `Engine`, `Hydraulics`, `Transmission`, `Electrical`, `Tires & Tracks`, `Structural`, `Operational`, `Weather`, `General` | — | Mechanical/operational sub-system. |
| `reason` | String | Yes | — | Specific text | — | Description of problem or scheduled work. |
| `downtimeHours` | Number | Yes | — | `0.1 - 24.0` | hours | Total downtime duration. |
| `repairHours` | Number | No | `0` | `0.0 - 24.0` | hours | Active wrench/repair time by technicians. |
| `isFailure` | Boolean | Yes | `false` | `true`, `false` | boolean | If `true`, qualifies as a machine breakdown failure for MTBF. |

---

### 2.7 Collection: `productiontargets` (Planning)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `date` | Date | Yes | — | Valid ISO Date | — | Calendar target date. |
| `shiftCode` | String | No | `"ALL"` | `A`, `B`, `C`, `ALL` | — | Target shift scope (`ALL` = 24-hr day target). |
| `materialCategory` | String | No | `"Total"` | `Mineral`, `Overburden`, `Total` | — | Commodity target boundary. |
| `targetTonnage` | Number | Yes | — | $\ge 0$ | tonnes | Budgeted extraction target. |

---

### 2.8 Collection: `mineproductionrecords` (Reference Benchmark)
| Attribute | Type | Req | Default | Enum / Range | Unit | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sourceId` | String | Yes | — | References `DataSource` | — | Provenance source ID. |
| `organization` | String | Yes | — | — | — | Public mining company (e.g., `Coal India Ltd`, `NMDC`). |
| `mineName` | String | Yes | — | — | — | Reference mine site. |
| `mineral` | String | Yes | — | `Coal`, `Iron Ore`, etc. | — | Mineral mined. |
| `fiscalYear` | String | Yes | — | Format `YYYY-YY` | — | Reporting fiscal year (e.g., `2023-24`). |
| `reportingMonth` | String | Yes | — | Month name & Year | — | Reporting month. |
| `productionTonnage`| Number | Yes | — | $\ge 0$ | tonnes | Official reported extraction volume. |
| `overburdenVolumeBcm`| Number | No | `0` | $\ge 0$ | BCM | Official reported overburden removed. |
| `strippingRatio` | Number | No | `0` | $\ge 0$ | $\text{m}^3/\text{t}$ | Official stripping ratio. |
| `averageAvailabilityPercent`| Number | No | — | `0 - 100` | % | Published DGMS/company availability average. |
| `averageUtilizationPercent` | Number | No | — | `0 - 100` | % | Published equipment utilization average. |

---

*All attributes documented in accordance with Indian mining industry norms and ISO 8601 timestamps.*

