# Backend Test Report & Calculation Verification

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 1.0  
**Phase:** Phase 2 — Testing & Quality Assurance  
**Date of Execution:** November 2026  
**Test Framework:** Native Node.js Test Runner (`node:test`, `node:assert/strict`)  

---

## 1. Executive Summary

A comprehensive automated test suite of **26 test cases** was implemented and executed across three dedicated test suites. All 26 tests passed with **zero failures and zero regressions**.

The test suites verify:
1. **Mathematical Accuracy of Mining Calculations:** Availability, Utilization, Match Factor, Pass Counts, Stripping Ratios, Reliability MTBF/MTTR, Fuel Burn, Operating Cost, and Shift-Target Prorating.
2. **Double-Counting Prevention:** Empirical proof that dumper delivered tonnage isolates net mine production from face-loading shovel records.
3. **Parameter Validation & Edge Cases:** Zero production, zero failures, missing parameters, inverted date ranges, and invalid enum values.
4. **Data Generation Integrity:** Strict conservation of scheduled hours ($T_o + T_i + T_m = 8.00\text{ h}$) and cycle phase summation ($t_w + t_l + t_h + t_d + t_r = T_c$).

---

## 2. Test Execution Output

```
> backend@1.0.0 test
> node --check src/server.js && node --check src/app.js && node --check src/utils/kpiUtils.js && node --test test/*.test.js

▶ Mechanical Availability (MA), Operating Utilization (OU), Use of Availability (UA)
  ✔ Standard normal operating shift (6.0h op, 1.2h idle, 0.8h maint) (2.25ms)
  ✔ Edge case: Machine broken down for entire shift (0h op, 0h idle, 8.0h maint) (1.70ms)
  ✔ Edge case: Zero scheduled hours (prevent division by zero) (0.32ms)
✔ Mechanical Availability (MA), Operating Utilization (OU), Use of Availability (UA) (6.87ms)

▶ Shovel-Dumper Match Factor (MF) and Pass Calculation
  ✔ Balanced fleet (MF = 1.0) (0.33ms)
  ✔ Under-trucked fleet (shovel starved, MF < 0.85) (0.29ms)
  ✔ Over-trucked fleet (trucks queuing, MF > 1.05) (0.27ms)
  ✔ Loading pass count estimation (0.35ms)
✔ Shovel-Dumper Match Factor (MF) and Pass Calculation (2.79ms)

▶ Stripping Ratios and Volumetric/Gravimetric Unit Conversions
  ✔ Volumetric and Gravimetric ratio calculations with density conversion (0.43ms)
  ✔ Zero coal production guard (zero division handling) (0.27ms)
✔ Stripping Ratios and Volumetric/Gravimetric Unit Conversions (1.59ms)

▶ Reliability Metrics: MTBF & MTTR with Qualifying Breakdown Isolation
  ✔ MTBF and MTTR only count unplanned breakdown events (0.57ms)
  ✔ Zero failures recorded (perfect reliability) (0.22ms)
✔ Reliability Metrics: MTBF & MTTR with Qualifying Breakdown Isolation (1.63ms)

✔ Haulage Cycle Time Non-Overlapping Phase Composition (0.28ms)
✔ Fuel Intensity and Specific Operating Cost (0.17ms)
✔ Production Double-Counting Prevention and Shift-Target Scaling (0.24ms)
✔ Date Range Validation (3.54ms)
✔ Shift Code Validation (0.50ms)
✔ Equipment Type Validation (1.88ms)
✔ Material Category Validation (0.51ms)
✔ parseFilterQuery Helper (0.56ms)
✔ Equipment Fleet Specification Verification (1.54ms)
✔ Material Catalog Physical Constants (0.49ms)
✔ Deterministic Simulation Generation & Hours Reconciliation (5.40ms)

ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 216.23
```

---

## 3. Detailed Test Results by Domain

### Suite 1: Mathematical Calculation Rules (`test/calculationRules.test.js`)
- **Availability & Utilization:** Verified that $MA = \frac{T_s - T_m}{T_s} \times 100$, $OU = \frac{T_o}{T_s} \times 100$, and $UA = \frac{T_o}{T_s - T_m} \times 100$. Confirmed mathematical identity $OU = \frac{MA}{100} \times UA$.
- **Match Factor Arithmetic:** Verified boundary behavior for balanced ($MF = 1.0$), under-trucked ($MF = 0.533$), and over-trucked ($MF = 1.40$) fleet configurations.
- **Pass Count Estimation:** Verified formula $N_p = \lceil \text{Payload} / (\text{Bucket Volume} \times \rho \times FF / SF) \rceil$.
- **Stripping Ratio Equivalence:** Verified that Volumetric Ratio $SR_v \times \rho_{\text{in-situ}} = SR_m$ (Gravimetric Ratio).
- **Reliability Event Filtering:** Confirmed that planned preventive maintenance ($T_{ms}$) and operational delays are excluded from failure count $N_f$, verifying that MTBF and MTTR compute solely on qualifying breakdown events.
- **Haulage Kinematics:** Verified that cycle time is the non-overlapping sum of queue, load, haul, dump, and return phases.
- **Double-Counting Guard:** Verified that filtering by `dumper` delivered tonnage accurately reflects net mine production without duplicating shovel excavation.

### Suite 2: Data Validation & Query Parsing (`test/dataValidation.test.js`)
- Verified date range validation rejecting missing dates, non-ISO formats, and inverted dates.
- Verified shift validation restricting to enum `["A", "B", "C"]`.
- Verified equipment type validator accepting all 8 types: `["all", "dumper", "shovel", "wheel_loader", "dozer", "drill", "motor_grader", "water_tanker"]`.
- Verified material category validation.

### Suite 3: Simulation Integrity & Hours Conservation (`test/simulationIntegrity.test.js`)
- Verified exact 16-unit equipment fleet composition (3 shovels, 1 loader, 7 dumpers, 2 dozers, 1 drill, 1 grader, 1 water tanker).
- Verified that for all 48 shift records generated per simulated day, $T_o + T_i + T_m = 8.00\text{ h}$ with zero variance.
- Verified that every haulage cycle record's individual phase components sum exactly to `totalCycleMinutes`.

---

*All backend calculation tests passed successfully. The backend is verified and ready for frontend integration in Phase 3.*

