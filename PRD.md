# PRD: EquipRoute Distribution Optimizer

**Project Name:** EquipRoute  
**Phase:** Phase 1 – Allocation Logic  
**Status:** Draft / Technical Requirements  

**Core Problem:**  
Maximizing student support while maintaining school-wide equity and strict inventory safety buffers.

---

## 1. Executive Summary

EquipRoute is a decision-support tool designed to manage the distribution of school uniforms and shoes. Unlike traditional inventory systems, EquipRoute operates on a **Collective Fulfillment** logic:

> A school is only eligible for delivery if **100% of its students’ needs** can be met while staying within the **90% SKU-specific inventory cap**.

---

## 2. Strategic Objectives

- **Operational Equity**  
  Eliminate the social friction of serving only a partial student body at a single location.

- **Inventory Integrity**  
  Automatically enforce a **10% safety buffer** across all SKUs (uniform types/sizes and shoe sizes).

- **Scale Maximization**  
  Use mathematical optimization to identify the combination of schools that results in the **highest total number of students served**.

---

## 3. Functional Requirements

### FR1: School-Level Demand Aggregation

The system must ingest individual student requirements and aggregate them into **School Demand Profiles**.

- **Student Requirement (1 full kit):**
  - 1 shirt (BLANCA or CELESTE, specific size)
  - 1 pants/skirt (FALDA AZUL CON TIRANTE, FALDA AZUL, FALDA BEIGE, SHORT AZUL, PANTALON BEIGE, or PANTALON AZUL, specific size)
  - 1 pair of shoes (specific size)

- **Aggregation Rule:**  
  - Total SKU demand per school =  
    \[
    \sum (\text{Student Needs})
    \]

- **Metadata:**  
  - Each school profile must include a `Total_Students` count used as a weighting factor in optimization.

---

### FR2: Inventory Safety Constraints

The system must enforce a global inventory safety threshold.

- **Threshold:**  
  - No allocation plan may consume more than **90%** of available stock for any single SKU.

- **SKU Independence:**
  - Constraints are enforced **per SKU**.
  - Example: `BLANCA-T8` and `BLANCA-T10` are independent constraints.

---

### FR3: The “All-or-Nothing” School Constraint

Each school is treated as a **binary unit**.

- **Fulfillment Rule:**  
  - If a school is selected, **every student** in that school receives a full kit.

- **Rejection Rule:**  
  - If inventory for **any single SKU** (e.g., Size 7 Shoes) is insufficient to serve all students in that school, the **entire school is excluded** from the distribution run.

---

### FR4: Optimization Logic (The Solver)

The system must use an **Integer Linear Programming (ILP)** approach.

- **Objective:**  
  - Maximize the sum of `Total_Students` for all selected schools.

- **Decision Variables:**  
  - Binary per school  
    - `1` = Serve School  
    - `0` = Skip School

- **Constraints:**  
  - For every SKU:  
    \[
    \text{Total Demand of Selected Schools} \le 0.9 \times \text{Total Stock Available}
    \]

---

## 4. Data Requirements & Schema

### Input Data

**Inventory Table**
- `SKU_ID` — format: `{TYPE}-{SIZE}` (e.g. `BLANCA-T10`, `PANTALON AZUL-T14`, `ZAPATO-34`)
- `Description`
- `Total_Stock_Available`

| Category | Types | Sizes |
|----------|-------|-------|
| Shirt | BLANCA, CELESTE | T1X, T4, T6, T8, T10, T12, T14, T16, T18, T20, T22 |
| Pants/Skirt | FALDA AZUL CON TIRANTE, FALDA AZUL, FALDA BEIGE, SHORT AZUL, PANTALON BEIGE, PANTALON AZUL | T1X, T2X, T4, T6, T8, T10, T12, T14, T16, T18, T20, T22 |
| Shoes | ZAPATO | 22–41 |

**Student Table**
- `Student_ID`
- `School_ID`
- `Shirt_SKU` — shirt type + size
- `Pants_SKU` — pants/skirt type + size
- `Shoe_Size_SKU` — shoe size

---

### Output Data

- **Selection Report**  
  - List of `School_ID`s approved for distribution

- **Inventory Impact Report**  
  - Predicted post-distribution stock levels  
  - Visibility into remaining **10%+ safety buffer**

- **Shortage Report**  
  - List of **Bottleneck SKUs** that prevented the next-largest school from being served

---

## 5. Success Metrics (KPIs)

- **Service Volume**  
  - Total number of students served globally

- **Constraint Adherence**  
  - 0% instances of any SKU exceeding the 90% usage cap

- **Inventory Utilization**  
  - Percentage of the usable 90% inventory pool successfully allocated

---

## 6. User Workflow

1. **Upload**  
   - Logistics admin uploads current inventory and student enrollment files

2. **Process**  
   - System runs the ILP Solver

3. **Review**  
   - Admin reviews:
     - Selected schools
     - Bottleneck SKU report

4. **Finalize**  
   - System generates a **Warehouse Picking List** organized by school
