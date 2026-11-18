# Mining Engineering KPI Definitions & Mathematical Formulations

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 1.0  
**Phase:** Phase 1 — Mathematical & Domain Engineering  

---

## 1. Time Component Standards in Surface Mining

Surface mining operations adhere to internationally recognized time classification models (e.g., AS 4242, DGMS, and CIL Operational Codes). Every scheduled shift (8 hours) is partitioned into three mutually exclusive components:

$$\text{Scheduled Time } (T_s) = \text{Operating Time } (T_o) + \text{Idle / Delay Time } (T_i) + \text{Maintenance Downtime } (T_m)$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Scheduled Time (Ts = 8.0 hrs)                     │
├──────────────────────────────────────────┬─────────────────────────────┤
│         Available Time (Ta = Ts - Tm)    │  Maintenance Downtime (Tm)  │
├────────────────────┬─────────────────────┼──────────────┬──────────────┤
│ Operating Time(To) │ Idle / Delay (Ti)   │ Scheduled(Tms│ Breakdown(Tmb│
└────────────────────┴─────────────────────┴──────────────┴──────────────┘
```

1. **Operating Time ($T_o$):** Time the equipment is actively digging, hauling, drilling, or dozing.
2. **Idle / Operational Delay Time ($T_i$):** Time equipment is mechanically available but non-productive due to operational constraints:
   - Shift changeover and operator briefing (typically 20–30 min/shift).
   - Lunch and meal breaks (typically 30 min/shift).
   - Waiting for dumper (shovel idle) or waiting in queue for shovel (dumper idle).
   - Haul road obstructions, dust settling, or blasting clearance.
   - Refueling delays.
3. **Maintenance Downtime ($T_m$):** Time equipment cannot operate due to mechanical or electrical reasons:
   - **Scheduled Maintenance ($T_{ms}$):** Periodic lubrication, 250-hour inspection, pre-shift safety check.
   - **Unplanned Breakdowns ($T_{mb}$):** Mechanical failures, hydraulic line blowouts, electrical malfunctions, tire cuts.

---

## 2. Core Equipment Performance KPIs

### 2.1 Mechanical Availability ($MA$)
Mechanical Availability measures the percentage of scheduled operational time that a machine is mechanically capable of working.

$$MA = \frac{T_s - T_m}{T_s} \times 100 = \frac{T_a}{T_s} \times 100 \quad [\%]$$

- **Benchmark:** DGMS and CIL guidelines specify $MA \ge 80\%$ for dumpers and $MA \ge 85\%$ for electric/hydraulic shovels.
- **Handling:** High $MA$ paired with low utilization indicates operational inefficiencies (excessive idle time or poor dispatch), not machine unreliability.

### 2.2 Use of Availability ($UA$)
Use of Availability evaluates how effectively mine management utilized the machine while it was mechanically ready.

$$UA = \frac{T_o}{T_a} \times 100 = \frac{T_o}{T_s - T_m} \times 100 \quad [\%]$$

- If $T_a = 0$ (machine down for entire shift), $UA = 0\%$.

### 2.3 Operating Utilization ($OU$)
Operating Utilization represents the true working fraction of scheduled shift time.

$$OU = \frac{T_o}{T_s} \times 100 \quad [\%]$$

*Mathematical Relationship:*
$$OU = MA \times UA = \left(\frac{T_a}{T_s}\right) \times \left(\frac{T_o}{T_a}\right) \times 100$$

### 2.4 Downtime Percentage ($DT\%$)
$$DT\% = \frac{T_m}{T_s} \times 100 \quad [\%]$$

---

## 3. Production & Target Attainment Metrics

### 3.1 Primary Production Boundary (Double-Counting Prevention)
In an opencast pit, material moved involves an excavator loading a truck.
- **Shovel Excavation:** Volume/tonnage loaded at the bench face.
- **Dumper Haulage:** Volume/tonnage delivered to the dumping point (crusher or spoil dump).

**System Boundary Rule:**
- **Mine Output Production:** Defined strictly as **Dumper Delivered Tonnage** ($\sum \text{materialTonnage}_{\text{dumper}}$).
- **Shovel Production:** Tracked as excavation/loading output.
- **Aggregate Rule:** When aggregating total mine production with filter `equipmentType = 'all'`, the engine must **never sum both shovel and dumper records**. Production is counted once via dumper delivery records.

### 3.2 Target Attainment Percentage ($PA$)
Target attainment compares actual production to budgeted target.

$$PA = \frac{\sum \text{Actual Production}}{\sum \text{Target Production}_{\text{adjusted}}} \times 100 \quad [\%]$$

#### Filter-Aware Target Scaling
When the user filters by a single shift ($k \in \{A, B, C\}$), comparing that single shift's production to a 24-hour daily target produces a false deficit (~33% attainment).
The engine applies a shift proportioning rule:

$$\text{Target}_{\text{shift}} = \text{Target}_{\text{shift, explicit}} \quad \text{or fallback to} \quad \text{Target}_{\text{daily}} \times w_s$$

where the engine first queries for an explicit target record with matching `shiftCode` (`A`, `B`, or `C`), and falls back to standard shift weight $w_s = \frac{1}{3} \approx 0.3333$ if only a 24-hour daily target is defined.

---

## 4. Haulage Cycle-Time Metrics

### 4.1 Total Dumper Cycle Time ($T_c$)
The haulage cycle is the sum of 5 non-overlapping phases:

$$T_c = t_w + t_l + t_h + t_d + t_r \quad [\text{minutes}]$$

Where:
- $t_w$ = Shovel queue/waiting time.
- $t_l$ = Spot and loading time.
- $t_h$ = Loaded transit time to dump.
- $t_d$ = Spot and tipping/dumping time.
- $t_r$ = Empty return transit time to bench.

### 4.2 Queue Contribution Ratio ($QCR$)
$$QCR = \frac{t_w}{T_c} \times 100 \quad [\%]$$

- $QCR > 20\%$ indicates severe haulage bunching or over-trucking at the loading face.

### 4.3 Dumper Hourly Productivity ($P_d$)
$$P_d = \frac{\text{Payload (tonnes)}}{T_c / 60} = \frac{\text{Payload} \times 60}{T_c} \quad [\text{t/hr}]$$

---

## 5. Shovel–Dumper Matching Dynamics

### 5.1 Match Factor ($MF$)
Match Factor evaluates whether the haulage fleet size matches the excavation rate:

$$MF = \frac{N_d \times t_l}{N_s \times T_c}$$

Where:
- $N_d$ = Number of operating dumpers assigned to the shovel.
- $N_s$ = Number of operating shovels (normally 1 for a single shovel-truck crew).
- $t_l$ = Shovel loading time per truck (minutes).
- $T_c$ = Total dumper cycle time (minutes).

#### Match Factor Diagnostic Matrix:
| Match Factor Range | Fleet Status | Primary Operational Bottleneck | Action Required |
| :--- | :--- | :--- | :--- |
| $MF < 0.85$ | **Severely Under-Trucked** | Shovel idle waiting for trucks. Shovel productivity depressed. | Allocate additional dumpers or shorten haul distance. |
| $0.85 \le MF \le 1.05$ | **Balanced Fleet** | Near-optimal truck and shovel synchronization. | Maintain dispatch pacing and road conditions. |
| $MF > 1.05$ | **Over-Trucked** | Trucks queuing at shovel bench ($t_w$ rises). Dumper utilization drops. | Reassign excess dumpers to longer hauls or stockpile loading. |

### 5.2 Loading Passes ($N_p$)
$$N_p = \left\lceil \frac{\text{Dumper Rated Payload}}{\text{Bucket Payload}} \right\rceil$$

Where:
$$\text{Bucket Payload} = \frac{V_b \times \rho_{\text{in-situ}} \times FF}{SF} \quad [\text{tonnes}]$$
- $V_b$ = Shovel bucket volume ($\text{m}^3$).
- $\rho_{\text{in-situ}}$ = Rock density ($\text{t/m}^3$).
- $FF$ = Bucket fill factor ($0.85 - 1.05$).
- $SF$ = Swell factor ($1.20 - 1.40$).

---

## 6. Overburden Stripping Ratio ($SR$)

Surface mining economics depend heavily on the volume of waste/overburden moved to recover mineral ore.

### 6.1 Volumetric Stripping Ratio ($SR_v$)
The industry standard in Indian opencast coal mining:

$$SR_v = \frac{\text{Volume of Overburden Removed in Bank Cubic Meters (BCM)}}{\text{Tonnage of Raw Coal / Ore Extracted (tonnes)}} \quad [\text{m}^3/\text{t}]$$

### 6.2 Gravimetric Stripping Ratio ($SR_m$)
$$SR_m = \frac{\text{Mass of Overburden Removed (tonnes)}}{\text{Mass of Raw Coal / Ore Extracted (tonnes)}} \quad [\text{t/t}]$$

### 6.3 Density Conversion Rule:
$$\text{Volume (BCM)} = \frac{\text{Mass of Overburden (tonnes)}}{\rho_{\text{in-situ, OB}} \quad (\text{t/m}^3)}$$

---

## 7. Equipment Reliability Metrics

Reliability calculations require strict boundaries:
- **Planned Preventive Maintenance is excluded from failure counts.**
- Only **Unplanned Mechanical/Electrical Breakdowns** qualify as failures.

### 7.1 Mean Time Between Failures ($MTBF$)
MTBF represents the average operating hours accumulated between breakdown events:

$$MTBF = \frac{\sum T_o}{N_f} \quad [\text{hours}]$$

Where:
- $\sum T_o$ = Total operating hours accumulated by the equipment during the period.
- $N_f$ = Total count of qualifying unplanned failure events ($isFailure = \text{true}$).
- If $N_f = 0$, $MTBF = \sum T_o$ (labeled as "No failures recorded").

### 7.2 Mean Time To Repair ($MTTR$)
MTTR evaluates maintenance responsiveness and repair complexity:

$$MTTR = \frac{\sum T_{\text{repair}}}{N_f} \quad [\text{hours}]$$

Where:
- $\sum T_{\text{repair}}$ = Total active repair hours dedicated to restoring equipment from failures.
- If $N_f = 0$, $MTTR = 0.0\text{ hours}$.

---

## 8. Specific Fuel & Operating Cost Metrics

### 8.1 Specific Fuel Consumption per Hour ($SFC_h$)
$$SFC_h = \frac{\text{Fuel Consumed (L)}}{T_o \text{ (hours)}} \quad [\text{L/h}]$$

### 8.2 Specific Fuel Consumption per Tonne ($SFC_t$)
$$SFC_t = \frac{\text{Fuel Consumed (L)}}{\text{Material Tonnage (t)}} \quad [\text{L/t}]$$

### 8.3 Specific Operating Cost per Tonne ($C_t$)
$$C_t = \frac{\text{Total Operating Cost (₹)}}{\text{Material Tonnage (t)}} \quad [₹/\text{t}]$$

- If production tonnage $= 0$, return $0.00$ to prevent division by zero.

---

*Formulas reviewed and cross-referenced with standard Indian Directorate General of Mines Safety (DGMS) circulars and SME Mining Engineering Handbook.*

