# Logoped Admin Panel — Frontend Design Spec
**Date:** 2026-06-19  
**Status:** Approved

---

## Overview

React-based admin panel for "Bog'chamiz" logoped center. Manages teachers, students, lessons, payments, parents, subjects, skills, assessments, and reports. First phase: full UI with mock data; API integration comes later.

---

## Tech Stack

| Tool | Choice |
|------|--------|
| Bundler | Vite |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| State | Local component state (no global store) |

---

## Project Structure

```
src/
  components/
    layout/
      Sidebar.tsx          # Left nav, logo, user footer
      Header.tsx           # Breadcrumb, search, notification bell
      AppLayout.tsx        # Sidebar + Header + <Outlet>
    dashboard/
      StatCard.tsx         # Reusable stat card (icon, value, label, badge)
      RecentLessons.tsx    # Table: student · subject · teacher · time · price · duration
      RecentPayments.tsx   # List: avatar · name · date · amount
  pages/
    Dashboard.tsx
    Teachers.tsx           # Placeholder
    Subjects.tsx           # Placeholder
    Students.tsx           # Placeholder
    Lessons.tsx            # Placeholder
    Payments.tsx           # Placeholder
    Parents.tsx            # Placeholder
    Skills.tsx             # Placeholder
    Assessment.tsx         # Placeholder
    Reports.tsx            # Placeholder
  data/
    mock.ts                # All mock data (students, teachers, lessons, payments)
  types/
    index.ts               # TypeScript interfaces
  App.tsx                  # Router + routes
  main.tsx
```

---

## Design Tokens

```ts
primary:   #32a86f   // green — sidebar active, badges, icons
bg:        #f8f9fa   // main content background
sidebar:   #ffffff   // white sidebar with right border
card:      #ffffff   // white cards with subtle shadow
text:      #111827   // headings
muted:     #6b7280   // secondary text
danger:    #ef4444   // debt/warning
```

---

## Layout

- **Sidebar** (fixed, 220px wide): Logo + "ADMIN PANELI", two nav sections (ASOSIY / RIVOJLANISH), user footer
- **Header** (sticky, full width minus sidebar): breadcrumb left, search + notification bell right
- **Content**: padded area, scrollable

---

## Dashboard Page

### Stat Cards (row of 4)
| Card | Icon | Value | Badge |
|------|------|-------|-------|
| O'quvchilar soni | GraduationCap | 6 | +6 oyda |
| Faol o'qituvchilar | Users | 5 | — |
| Kelgan to'lovlar | DollarSign | 1 760 000 so'm | Shu oy |
| Jami qarzdorlik | AlertTriangle | 960 000 so'm (red) | 3 qarzdor |

### Oxirgi darslar (left panel)
Table columns: student, subject, teacher, date+time, price, duration  
"Barchasi →" link top right

### Oxirgi to'lovlar (right panel)
List: avatar initials, name, date, amount (+green)  
"Barchasi →" link top right

---

## Navigation Items

**ASOSIY**
- Dashboard `/`
- O'qituvchilar `/teachers` (badge: 6)
- Fanlar `/subjects`
- O'quvchilar `/students` (badge: 6)
- Darslar `/lessons`
- To'lovlar `/payments`
- Ota-onalar `/parents`

**RIVOJLANISH**
- Ko'nikmalar `/skills`
- Baholash `/assessment`
- Hisobotlar `/reports`

---

## Mock Data

Located in `src/data/mock.ts`. Exports:
- `students: Student[]`
- `teachers: Teacher[]`
- `lessons: Lesson[]`
- `payments: Payment[]`

All data mirrors what's visible in the design screenshot (Ali Karimov, Zarina Yusupova, Diyor Ortiqov, Madina Soliyeva, etc.)

---

## Phase 1 Scope

- [x] Vite + React + TS + Tailwind project setup
- [x] AppLayout (Sidebar + Header)
- [x] Dashboard page (stat cards + two panels)
- [x] All other pages as styled placeholders with nav working
- [ ] API integration — Phase 2

---

## Out of Scope (Phase 1)

- Authentication / login page
- Forms (add/edit students, teachers, etc.)
- Real API calls
- Mobile responsiveness (desktop-first)
