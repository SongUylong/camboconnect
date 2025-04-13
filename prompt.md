CamboConnect: Centralized Opportunities Platform
Core Features for Development
1. User Authentication
Registration via email or social media
User login functionality
Different access levels (guest vs. registered users)
Password reset functionality
Two-factor authentication (2FA) for credential-based accounts
2. Opportunity Management
Categorized listings by organization type (Startups, Hackathons, Incubation Programs, Competitions, Internships)
Status indicators ("Opening Soon", "Closing Soon", "Active")
Event visit count tracking
3. Opportunity Cards
Visual card display for each opportunity
Key information displayed:
Title
Organization
Deadline/Timeline
Status indicator (color-coded)
Brief description
Category/type indicator
Visit count
Action buttons (bookmark, apply, view details)
Visual indicators for new or popular opportunities
4. Opportunity Detail Page
Comprehensive information about the opportunity:
Full description and overview
Eligibility requirements
Application process and deadlines
Timeline of the opportunity
Benefits and rewards
Contact information
Related resources or links
Application button or external application link
Bookmark/save functionality
Share options
Previous participants section at the bottom
Organization information and link to organization profile
5. Community/Organization Page
Split-view layout:
Left sidebar: List of all organizers/organizations
Right content area: Selected organization details
Organization profile components:
Basic information and description
History of the organization
Terms of Service
Reviews from participants
Organization-specific events with filtering options
Follow/subscribe button for notifications
Organization-specific event listing with sorting and filtering
6. Search and Filtering
Sort by latest updates and active status
Filter by eligibility criteria, education level, location, and deadline
Organization-specific filters on the Community page
7. User Engagement
Bookmark functionality
Notification system (website inbox and email)
Follow organizations for updates
8. User Profiles & Privacy
Profile page showing user's information, education, skills, and opportunity history
Previous participation automatically tracked and added to profile
Privacy controls for profile visibility (Public, Only Me)
Default privacy setting for new participations
Friend connection management limited to accepting/sending friend requests
Friend profiles visible based on their privacy settings
9. Previous Participants Display
Previous participants section at the bottom of opportunity detail page
Participant visibility respects individual privacy settings
Displays participant name and profile image (if public)
Clickable participant entries linking to their profile pages
Add friend option for visible participant profiles
10. Application Status Tracking
Follow-up popup on return visit after clicking "Apply"
Status confirmation request ("Did you complete your application?")
Options to select application status (Applied, Not Applied, Will Apply Later)
Optional feedback about application process
Status tracking in user profile
11. Admin Dashboard
CRUD operations for content management
Bulk data entry via CSV/Excel upload
Platform analytics monitoring
User Flow
1. Guest User Flow
Landing on the home page
Browsing limited opportunity listings and categories
Viewing basic organization information
Attempting to access detailed opportunity information → Prompt to register/login
Registration process (email/social media signup)
2. New User Registration Flow
Complete registration form
Create initial profile (basic information)
Set privacy preferences
Redirected to opportunities page
3. Account Management Flow
Password reset process:
Request reset via "Forgot Password" link
Receive reset link via email
Create new password
Confirmation of password change
2FA setup (for credential-based accounts only):
Option to enable 2FA in account settings
Choose authentication method (app or SMS)
Generate/receive verification codes
Verify and complete setup
4. Returning User Login Flow
Login via credentials or social media
Enter 2FA code if enabled (credential-based accounts only)
View notification updates
Land on personalized home page
5. Opportunity Page Flow
Browse all opportunities across different organizers
Apply global filters (type, deadline, etc.)
Sort by various criteria
View opportunity cards
Click on cards to access detailed opportunity page
Bookmark opportunities directly from cards
6. Community Page Flow
View list of all organizers in the left sidebar
Select an organizer to view their profile in the right content area
See organizer's basic information, history, and reviews
Browse only that organizer's events with organization-specific filtering
Follow/subscribe to receive notifications from the selected organizer
View opportunity cards for that specific organization
Click cards to access detailed opportunity pages
7. Event Detail & Application Flow
Access full opportunity information on the detail page
Read comprehensive description, eligibility requirements, and timeline
Review benefits, contact information, and application instructions
Bookmark opportunity for later reference
Share opportunity with others
Decide to apply for the opportunity
Click "Apply" button on detail page
Complete application form or redirect to external application site
Application automatically recorded as "Pending Confirmation" in system
Return to platform on a later visit:
Presented with follow-up popup asking "Did you complete your application to [Opportunity Name]?"
Select status (Applied, Not Applied, Will Apply Later)
Provide optional feedback about application process
Updated status saved to user profile
Scroll to previous participants section at bottom of page
View participant profiles that are set to public
Click on participant names to visit their profile pages
Send friend requests to participants of interest
8. Profile Management Flow
Update personal information
Adjust global privacy settings
Set individual privacy for each past participation
Accept/decline incoming friend requests
View friend list and their profiles (based on their privacy settings)
9. Admin User Flow
Manage platform content
Monitor analytics
Handle user accounts and reported content



