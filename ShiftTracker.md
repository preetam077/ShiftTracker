Build a clean, responsive shift-tracking web app for a part-time worker in Germany.

Purpose:
I work different part-time jobs at different companies and want to track my shifts, hours, hourly pay, and monthly earnings.

Core Features:

1. Shift Entry Form
Create a form where I can add a work shift with the following fields:
- Work date
  - Default value should be today’s date.
  - User must be able to change it manually.
- Company name
  - Example: DHL, kitchen assistant agency, restaurant, warehouse, etc.
- Job role / position
  - Example: Kitchen Assistant, Warehouse Worker, Sortation Associate.
- Start time
- End time
- Hourly pay in euros
- Optional note field

2. Automatic Calculations
After entering start time and end time:
- Automatically calculate total hours worked.
- If the shift crosses midnight, handle it correctly.
  - Example: 22:00 to 06:00 = 8 hours.
- Automatically calculate earnings:
  earnings = total hours × hourly pay

3. Save Shift Records
Each shift should be saved locally first.
Use browser localStorage for the first version.
Structure the code so that later it can be connected to a backend/database.

4. Shift List / History Page
Show all saved shifts in a clean table/card layout with:
- Date
- Company
- Role
- Start time
- End time
- Total hours
- Hourly pay
- Total earnings
- Notes
- Edit button
- Delete button

5. Monthly Dashboard
Create a dashboard where I can select month and year.
For the selected month, show:
- Total working days
- Total hours worked
- Total earnings
- Number of shifts
- Average hourly pay
- Earnings grouped by company

Example company summary:
DHL:
- Total shifts: 4
- Total hours: 38
- Hourly pay: €14.50
- Total earnings: €551.00

Restaurant A:
- Total shifts: 3
- Total hours: 14
- Hourly pay: €13.00
- Total earnings: €182.00

Also show grand total earnings for the month.

6. Filtering and Sorting
Allow filtering by:
- Month/year
- Company
- Job role

Allow sorting by:
- Date
- Company
- Total hours
- Earnings

7. UI/UX Requirements
Design should be simple, modern, and mobile-friendly.
Use a clean dashboard style.
Use cards for summary statistics.
Use a table for detailed shift records on desktop.
Use stacked cards on mobile.
Use euro formatting, e.g. €145.50.
Use 24-hour time format.
Use European date format: DD.MM.YYYY.

8. Data Validation
Validate that:
- Date is required.
- Company name is required.
- Start time and end time are required.
- Hourly pay must be positive.
- Total hours must be calculated correctly.

9. Suggested Tech Stack
Build using:
- React or Next.js
- TypeScript preferred
- Tailwind CSS for styling
- localStorage for data persistence
- No external backend for the first version

10. Code Quality
Write clean, modular code.
Use components such as:
- ShiftForm
- ShiftList
- ShiftCard
- MonthlyDashboard
- CompanySummary
- FilterControls

Use a clear data model:

Shift {
  id: string;
  date: string;
  company: string;
  role: string;
  startTime: string;
  endTime: string;
  hourlyPay: number;
  totalHours: number;
  totalEarnings: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

11. Extra Nice Features
Add:
- Export monthly data as CSV
- Confirm before deleting a shift
- Show most recent shifts first
- Show “This Month” summary by default
- Add a button to quickly add another shift after saving

Final Output:
Generate the full working code for the complete web app.
Make sure it runs locally without errors.
Include installation and run instructions.
Use a polished, professional design suitable for personal finance/work tracking.