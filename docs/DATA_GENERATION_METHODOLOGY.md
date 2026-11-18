# Synthetic Data Generation Methodology

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 1.0  
**Phase:** Phase 2 — Synthetic Data Engineering  

---

## 1. Principles of Engineering-Authentic Simulation

The synthetic dataset powers the detailed shift-level and equipment-level analytical modules of the Surface Mining Dashboard. To maintain academic and technical credibility, the generator does not emit independent random numbers; rather, it simulates physical mine operations governed by deterministic mechanical, kinematic, and operational relationships.

### Simulation Integrity Tenets:
1. **Mathematical Time Balance:** Scheduled shift time ($8.00\text{ h}$) is strictly conserved across Operating, Idle, and Maintenance components:
   $$T_o + T_i + T_m = 8.00\text{ hours}$$
2. **Kinematic Cycle Consistency:** Every dumper trip consists of five discrete non-overlapping phases whose sum equals the total cycle time:
   $$t_w + t_l + t_h + t_d + t_r = T_c$$
3. **Payload & Capacity Physics:** Dumper payload is constrained to $92\% - 104\%$ of rated manufacturer payload, preventing unphysical loads.
4. **Specific Fuel Intensity:** Diesel fuel consumption is proportional to engine rated power (HP), operating hours ($T_o$), and machine duty cycle.
5. **Reproducibility:** A deterministic pseudo-random number generator (PRNG) parameterized with a fixed base seed guarantees identical data generation across restarts.

---

## 2. Deterministic PRNG & Seeding Architecture

The generator uses a deterministic sinusoidal pseudo-random generator:

```javascript
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const randomBetween = (min, max, seed) => min + (max - min) * seededRandom(seed);
```

For every calendar day $d \in [0, 29]$, shift $s \in [0, 2]$, and equipment index $e \in [0, 15]$:
$$\text{Seed} = \text{SEED\_BASE} + d \times 500 + s \times 60 + e \times 3$$
Where default $\text{SEED\_BASE} = 1337$.

---

## 3. Physical Models & Mechanics

### 3.1 Shift Time Partitioning Model
For each 8-hour shift:
1. **Maintenance Probability Check:**
   - With probability $P_{\text{unplanned}} \approx 12\%$, an **Unplanned Breakdown** occurs ($T_m \in [1.2, 3.8]\text{ h}$). An associated `DowntimeEvent` is emitted with `isFailure = true` and wrench repair hours $T_{\text{repair}} = T_m \times \text{repairRatio}$.
   - With probability $P_{\text{planned}} \approx 12\%$, a **Planned PM Service** occurs ($T_m \in [0.8, 2.0]\text{ h}$). Emitted with `isFailure = false` and $T_{\text{repair}} = 0$.
   - Otherwise, $T_m = 0$.
2. **Idle Time ($T_i$):**
   - Incorporates operational delay baselines: shift changeover (0.4h), meal breaks (0.5h), blasting bench clearance, and weather delays.
   - Base idle: $0.8 - 1.6\text{ h}$ (elevated to $1.5 - 2.5\text{ h}$ on adverse weather days occurring every ~9 days).
3. **Operating Time ($T_o$):**
   $$T_o = \max(0, 8.00 - T_m - T_i)$$
   Reconciled idle is calculated as $T_i = 8.00 - T_o - T_m$ to enforce exact zero-sum balance.

### 3.2 Haulage Cycle Phase Model
For each dumper shift, total trips completed:
$$\text{Trips} = \left\lfloor \frac{T_o \times 60}{\bar{T}_c} \right\rfloor$$
Where $\bar{T}_c \approx 20 - 26\text{ minutes}$.

For each individual trip $t$:
- **Queue Wait Time ($t_w$):** $1.5 - 4.8\text{ min}$ (bench queue before spotting).
- **Spot & Loading Time ($t_l$):** $2.8 - 4.2\text{ min}$ (multi-pass loading by hydraulic shovel).
- **Loaded Travel Time ($t_h$):** $6.5 - 9.5\text{ min}$ (transit to coal siding or OB waste dump).
- **Spot & Dump Time ($t_d$):** $1.2 - 2.0\text{ min}$ (maneuver and hydraulic hoist tipping).
- **Empty Return Time ($t_r$):** $5.5 - 8.0\text{ min}$ (unloaded high-speed transit back to bench).
- **Total Cycle Time ($T_c$):** Exact sum of the five component durations.

### 3.3 Production & Density Conversion Model
- For Coal Bench: Material `COAL_ROM`, In-situ density $\rho = 1.35\text{ t/m}^3$, Swell $SF = 1.25$.
- For Overburden Bench: Material `OB_SANDSTONE` ($\rho = 2.40\text{ t/m}^3$) and `OB_SHALE` ($\rho = 2.10\text{ t/m}^3$).
- Shift Tonnage for dumpers: $\sum_{t=1}^{\text{Trips}} \text{Payload}_t$.
- Volume in Bank Cubic Meters:
  $$V_{\text{BCM}} = \frac{\text{Tonnage}}{\rho_{\text{in-situ}}}$$

### 3.4 Fuel & Cost Model
- **Diesel Fuel Rate:**
  $$\text{Fuel Rate } (L/h) = \text{Rated Engine HP} \times 0.042 \times \text{variance}$$
  - 1004 HP Dumper (CAT 777E): $\approx 38 - 45\text{ L/operating hour}$.
  - 1260 HP Shovel (PC3000): $\approx 50 - 58\text{ L/operating hour}$.
  - 410 HP Dozer (D375A): $\approx 16 - 20\text{ L/operating hour}$.
- **Operating Cost Components:**
  $$\text{Cost} = (\text{Fuel Liters} \times ₹92) + (T_o \times ₹950) + (T_m \times ₹1600) + (8.0 \times ₹350)$$

---

## 4. Execution & Reproducibility Guide

To regenerate the 30-day dataset:
```bash
cd UGP/backend
npm run seed:drop
```
Command-line options:
- `SEED_DAYS=30`: Duration in days (default: 30).
- `SEED_BASE=1337`: Pseudo-random base seed.
- `--drop`: Drops existing collections prior to insertion.

---

*Verified against physical HEMM operational logs and DGMS standard HEMM guidelines.*

