Design a complete modern responsive web application called "Smart Lost & Found Management System" for railway stations and bus terminals.

The application helps passengers report lost items, staff register found items, AI automatically match lost and found items, and administrators verify ownership before returning items.

Technology inspiration:
React + Spring Boot + AI Matching + Oracle Database.

Design Style:
- Modern SaaS application
- Google Material Design 3
- Clean minimal UI
- Professional enterprise product
- Light theme
- Responsive Web Application
- Font: Inter
- Primary Color: #2563EB
- Secondary Blue: #1D4ED8
- Background: #F8FAFC
- Card Background: #FFFFFF
- Primary Text: #111827
- Secondary Text: #6B7280
- Borders: #D1D5DB
- Success: #16A34A
- Warning: #CA8A04
- Error: #DC2626
- Rounded corners (12px–16px)
- Soft shadows
- Spacious layout
- Modern icons
- Plenty of white space
- Responsive desktop layout (1440×1024)

------------------------------------------------
APPLICATION FLOW
------------------------------------------------

Landing Page

↓

Login

↓

Authenticate User

↓

Check Role

↓

IF USER
Go to User Portal

IF STAFF
Go to Staff Portal

IF ADMIN
Go to Admin Dashboard

------------------------------------------------
LANDING PAGE
------------------------------------------------

Create a beautiful landing page.

Hero Section:
Large railway station illustration.
Lost luggage illustrations.
Modern AI-themed graphics.

Headline:
"Smart Lost & Found Management System"

Subtitle:
"AI-powered platform helping passengers reunite with their belongings quickly and securely."

Buttons:
Login
Register

Navigation:
Home
Features
About
Contact

Feature cards:
AI Image Matching
Secure Claim Verification
Real-Time Tracking
Multi-Station Support
Fast Recovery

Footer with contact information.

------------------------------------------------
LOGIN PAGE
------------------------------------------------

Modern centered login form.

Fields:
Email
Password

Buttons:
Login

Links:
Forgot Password
Create Account

Social Login:
Google

On successful login:

Backend checks role.

Roles:
USER
STAFF
ADMIN

Redirect automatically based on role.

------------------------------------------------
USER PORTAL
------------------------------------------------

Sidebar:
Home
Report Lost
Report Found
AI Matches
My Reports
Notifications
Profile
Logout

Top Bar:
Search
Notifications
User Profile

Dashboard Cards:
Lost Reports
Found Reports
AI Matches
Claim Status

Quick Actions:
Report Lost
Report Found
Search Items

Recent AI Matches section.

------------------------------------------------
REPORT LOST PAGE
------------------------------------------------

Fields:
Item Name
Category
Lost Date
Lost Time
Station / Bus Stand
Description
Upload Multiple Images

Enable AI Matching Toggle

Submit Button

On submit:
Save report
Run AI Matching

------------------------------------------------
REPORT FOUND PAGE
------------------------------------------------

Fields:
Item Name
Category
Found Date
Found Time
Found Location
Description
Upload Images

Register Found Item Button

------------------------------------------------
AI MATCH RESULTS PAGE
------------------------------------------------

Title:
AI Match Results

Success Banner:
"AI Analysis Complete"

Cards showing:

Image

Item Name

Match Percentage

Found Station

Date

Confidence Badge

View Details Button

Use color-coded confidence:

Green:
90–100%

Yellow:
80–89%

Red:
Below 80%

------------------------------------------------
MATCH DETAILS PAGE
------------------------------------------------

Large item image

Item details

Found location

Date

Description

Who reported it

AI Explanation Card:

"Why AI thinks this is a match"

Confidence Score

Claim Item Button

------------------------------------------------
CLAIM VERIFICATION PAGE
------------------------------------------------

Explain ownership verification.

Verification Questions:

Item Color

Brand

Unique Identification Marks

Contents inside item

Upload Additional Proof

OTP Verification

Submit Claim Button

------------------------------------------------
CLAIM SUCCESS PAGE
------------------------------------------------

Large success illustration.

Message:

"Claim Submitted Successfully"

Status Timeline:

Submitted

Under Verification

Approved

Ready for Collection

Download Receipt Button

------------------------------------------------
MY REPORTS PAGE
------------------------------------------------

Tabs:

Active Reports

Matched

Pending

Closed

Cards showing:

Item

Status

Date

AI Match %

Track Button

------------------------------------------------
NOTIFICATIONS PAGE
------------------------------------------------

Notifications list.

Examples:

AI found a 92% match.

Claim approved.

Verification requested.

Item ready for pickup.

------------------------------------------------
PROFILE PAGE
------------------------------------------------

Profile Picture

Personal Information

Phone

Email

Password

Notification Settings

Dark Mode Toggle

Logout

------------------------------------------------
STAFF PORTAL
------------------------------------------------

Staff dashboard for railway/bus station employees.

Sidebar:

Dashboard

Register Found Item

Manage Found Items

Pending Claims

AI Matches

Notifications

Profile

Functions:

Register newly found items

Upload images

Update item status

Transfer items between stations

Approve collection requests

------------------------------------------------
ADMIN DASHBOARD
------------------------------------------------

Professional enterprise dashboard.

Sidebar:

Dashboard

Lost Items

Found Items

AI Match Review

Claim Requests

Users

Stations

Analytics

Reports

Settings

Logout

Top Bar:

Search

Notifications

AI Status

Admin Profile

------------------------------------------------
ADMIN DASHBOARD CONTENT
------------------------------------------------

Statistics Cards:

Total Lost Reports

Total Found Items

Pending Claims

Successful Returns

AI Match Accuracy

Large Analytics Charts:

Monthly Lost Reports

Monthly Found Reports

Claim Success Rate

Most Lost Categories

Station-wise Reports

------------------------------------------------
LOST ITEMS MANAGEMENT
------------------------------------------------

Advanced searchable table.

Columns:

Image

Item Name

Category

Reported By

Date

Station

Status

Actions

Actions:

View

Edit

Delete

------------------------------------------------
FOUND ITEMS MANAGEMENT
------------------------------------------------

Table with uploaded found items.

Approve

Reject

Archive

------------------------------------------------
AI MATCH MANAGEMENT
------------------------------------------------

AI comparison page.

Each match shows:

Lost Item Image

Found Item Image

Similarity Score

AI Confidence

Matched Features

Approve Match

Reject Match

Manual Review

------------------------------------------------
CLAIM MANAGEMENT
------------------------------------------------

Review submitted ownership claims.

Display:

User Details

Matched Item

Uploaded Proof

Verification Answers

Approve Button

Reject Button

Request More Information

------------------------------------------------
USER MANAGEMENT
------------------------------------------------

Table of users.

Name

Role

Email

Phone

Status

Actions

------------------------------------------------
ANALYTICS PAGE
------------------------------------------------

Professional BI dashboard.

Charts:

Monthly Reports

AI Accuracy

Average Recovery Time

Claim Success Rate

Heat Map

Most Common Lost Items

Most Active Stations

------------------------------------------------
SETTINGS PAGE
------------------------------------------------

Manage:

AI Threshold

System Configuration

Notification Settings

Backup

Security

------------------------------------------------
COMMON DESIGN SYSTEM
------------------------------------------------

Use consistent:

Buttons

Cards

Input Fields

Tables

Dialogs

Badges

Charts

Icons

Typography

Spacing

------------------------------------------------
INTERACTIONS
------------------------------------------------

Use realistic hover states.

Interactive buttons.

Dropdowns.

Date Pickers.

Search.

Filters.

Pagination.

Success/Error snackbars.

Loading screens.

Empty states.

------------------------------------------------
FINAL GOAL
------------------------------------------------

Generate a complete professional production-ready UI/UX prototype comparable to applications built by Microsoft, Google, Atlassian, Notion, Linear, and Vercel.

Maintain a consistent design language across every page with modern enterprise-level UI, accessibility, responsive layouts, reusable components, polished interactions, and pixel-perfect alignment.