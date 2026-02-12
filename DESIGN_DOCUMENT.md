# Design Document: EquipRoute Mobile

## 1. Visual Language & Aesthetics

### Theme
**Functional Minimalist**  
Priority on data legibility over decorative elements.

### Color Palette
- **Primary Blue (#2D5BFF):** Action buttons and navigation
- **Success Green (#27AE60):** Schools with 100% fulfillment
- **Warning Amber (#F2994A):** SKUs approaching the 90% cap
- **Error Red (#EB5757):** Schools blocked by inventory shortages

### Typography
- Sans-serif (e.g., **Inter** or **Roboto**)
- **Bold** weights for SKU counts  
- **Medium** weights for school names

---

## 2. Key Screen Workflows

### A. The Optimization Dashboard (Home)
The **Control Center** where the user triggers the allocation algorithm.

- **Header:** Real-time *Global Health* bar showing total student coverage
- **The “Optimize” Action:** Prominent Floating Action Button (FAB) to run the ILP solver
- **Status Cards:** Summary of *Eligible Schools* vs. *Blocked Schools*

---

### B. School Selection List (The “Output” View)
A vertical list of schools, ranked by student count.

**Card Design:**
- **Left:** School name & district
- **Center:** Progress bar showing *Kit Readiness*  
  *(should always be 100% for selected schools)*
- **Right:** Total student count served

**Interactions:**
- Tap to view the specific **Shopping List** of sizes required for that campus

---

### C. Inventory “Safety Wall” (The Monitor)
A specialized view to track the **90% stock cap**.

- **Visual Element:** Horizontal gauge charts for high-risk SKUs
- **The “Bottleneck” Insight:**  
  Highlights the single limiting item preventing additional schools from being served  
  > Example: *"Missing 12 units of ZAPATO-34 to unlock Springfield High"*

---

## 3. UI Component Specifications

| Component            | UX Purpose                               | Inspiration / Detail |
|---------------------|-------------------------------------------|----------------------|
| Fulfillment Badge   | Shows *Full Kit Guaranteed*               | Green pill-shaped label with a checkmark icon |
| Constraint Gauge    | Monitors the 90% SKU limit                | Semi-circle gauge that turns red as it nears the safety buffer |
| School Card         | Aggregates demand data                    | Glassmorphism effect with subtle shadows to separate **Selected** vs **Excluded** schools |
| Quick Filter        | Sorting tool for admins                  | Sticky top bar to filter by *Most Students* or *Fewest Bottlenecks* |

---

## 4. Information Architecture (Site Map)

- **Home:** Summary metrics & trigger solver
- **Approved Schools:** Detailed list of campuses to be served
- **Inventory Health:** SKU-level stock vs. the 90% cap
- **Warehouse Prep:** Picking view grouped by  
  **School → Student → Items**

---

## 5. Mobile-Specific Features

- **Haptic Feedback:** Vibrates when the 90% limit is breached during manual adjustments
- **Pull-to-Refresh:** Re-syncs latest inventory levels from the central database
- **Scan-to-Verify:**  
  Built-in barcode scanner (camera-based) for warehouse workers to verify kits against the **Approved** list
