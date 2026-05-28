======================================

my NOTES/GUIDE

QUICK START / DEBUGGING GUIDE

1. BACKEND (Authentication & Data)
   - cd backend
   - venv\Scripts\activate
   - python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

2. FRONTEND (PWA & Offline Test)
   - cd frontend
   - npm run test:offline
   - (Served on http://localhost:4173)

Running offline test:
3. MOBILE TUNNEL (For Phone/External Testing)
   - npx ngrok http 4173
   - (Open the secure https://...ngrok-free.dev link on your phone)

IMPORTANT: Need to have the BACKEND running to log in or download resources. Once "Resources Downloaded" is successful, then  can test fully offline!

======================================

Test teacher acc:

admin_teacher

LogicPlay2024!


prof_mark

mark123


teacher_mark

mark123

Class Code
Y3A01S
7MKYKO
DM95AJ


======================================

Essentials:

- how do we confirm or validate a teacher account?
- Preview of the saved circuit 
- Preview of circuit in the submission review modal
- teachers can precreate assignments for the class and can do assignment on a later date or time
- light mode UI fix (everything is too bright)
- I/O gates labeling 
- 

======================================

Update features:

- a report generating feature for student to have a soft copy of its work, and then with the logical gate made by the player also the truth table, and timestamp(the date it is generated, name,)
- sprite(for a helper/hint-giving character in the game - humanoid, can be customized for gender, or can be a robot, this sprite will be available always via a button in the settings) 

- Edit username for teacher account, also for student account
- First open, tutorial for both teacher and student for the playground - and this ttorial will be available always via a button in the settings
- notification badge in class when there is an assingment assigned
- password validation (for both teacher and student), to ensure no weak passwords allowed
- change email
- additional expression input in activity/assignment


======================================

Error:

- MVP (non so far)


======================================

Bug:

- MVP (non so far)
- can duplicate class create(with the same name)
- Test Case - List of enrolled students with join dates (no date appearing for teacher when student actually joined the class)
- Test Case - when teacher clicks "View Submission" (for student's assignment) in assignment list - no modal appear
- truth table is not scrollable(stucked-up), stock up (wires not connected, maybe having fixed right sidebar)
- 


======================================

Notes:

- maximum of 2-4 input (gates) (AND, OR, NOT => priority) (extra => NAND, NOR, XOR, XNOR), only one output
- adding light mode for user adaptability and personalization (when claude sonnet resets)
- the logo should look like, minimal, modern, clean, techy, and has color palette of blue, white, etc. (calming color palette)
- port forwarding static - for regex-based interceptor

- loading circuit in student dashboard - view mode only or can do editing too
- When teacher logs in, and there is no class yet, there should be a guide to create one

-secretkey

Quick Reference:
Mobile/Tablet (< 768px): Components are stacked, and the navigation/sidebars are hidden or converted to bottom sheets.
Medium (768px to 1023px): Sidebars appear in the Dashboard, but the Playground still uses the mobile-optimized toolbar.
Desktop (≥ 1024px): Full "Cyber-Neon" layout with side-by-side toolbars, canvas, and property panels.

- not Integration of ML model, created one 
- 

======================================

Questions:

- how to confirm teacher account?


==================================================================

SYSTEM OPTIMIZATIONS:

Global Disable: 
Added user-select: none; to the body element in index.css file. This tells the browser to prevent text selection for any element inside the body by default. This is what stops the annoying blue highlights when you click and drag gates.

Selective Enable: 
Since still want to be able to type in things like the "Save Circuit" modal, added a rule to re-enable text selection specifically for input and textarea elements.

1. Fixed PWA Route Caching Bug (vite.config.js)
The Problem: The PWA Service Worker was hardcoded to only cache API responses that matched /localhost:8000/api/. 
The Fix: I modified the Workbox urlPattern RegEx rule (/^https?:\/\/[^\/]+:8000\/.*/i). It now universally intercepts and caches any API request directed to port 8000.

2. Upgraded the "Download Resources" Trigger (InstallTrigger.jsx)
The Problem: When a user clicked "Download Resources", it pre-fetched generic resources but didn't account for user-specific data.
The Fix: I updated the data pre-fetching pipeline to check the localized localStorage user profile:
- If a Student: It fetches challenges, leaderboard, assignments, classrooms, and saved circuits.
- If a Teacher: It fetches dashboard essentials, classrooms, and created assignments.

3. Verified App Manifest and Structure
- Service Worker Registration: Verified frontend handles the lifecycle (autoUpdate ensured).
- Manifest Icons: Confirmed manifest.webmanifest compiles successfully with 192px, 512px, and apple-touch icons.
- IndexedDB Offline Save: Confirmed offlineSync.js operates smoothly, diverting saveCircuit() to IndexedDB when offline.


======================================
PROMPTS:

# Prompt for Adding 2nd Feature on Playground (Mobile View)

## Objective
Add a "Challenge List" toggle button to the mobile playground interface. This allows students to view and switch between available challenges without leaving the simulation environment.

## Design & UX Requirements
-   **Location**: In the floating toolbar, positioned between the "Reset" button and the "Submit" button.
-   **Appearance**:
    -   A square-shaped button (matching the size of the Reset button).
    -   **Icon**: Use a scroll or checklist icon (e.g., `☰` with a dot, or a specific `challenge-icon`).
    -   **Style**: Must match the Cyber-Neon aesthetic (Dark blue/purple background, glowing border, white icon). Should be disabled (grayed out) if `isPlaying` is true.
-   **Behavior**:
    -   Tapping the button should slide open the `ChallengeList` component from the right side.
    -   The drawer should have a "Close" button (X icon) at the top right.
    -   Clicking the Close button should slide the drawer shut.
    -   The drawer must not obscure the main circuit canvas area (it should sit on top of the canvas but leave room for the circuit).

## Technical Implementation Details
1.  **State Management**: Add `showChallenges` state in `Playground.jsx` (default: `false`).
2.  **Component Integration**: Render the `ChallengeList` component conditionally based on the `showChallenges` state.
3.  **Styling**: Ensure the drawer uses `transform: translateX(0)` to slide in and `transform: translateX(100%)` to slide out. Use `transition-transform` for the animation.

## Verification Checklist
- [ ] Can open the Challenge List by tapping the icon.
- [ ] Can close the Challenge List by tapping the 'X'.
- [ ] Button is hidden/disabled when the circuit is playing.
- [ ] Drawer animation is smooth and uses the Cyber-Neon theme.

- for this game, craft a prompt to generate a background image for the playground (cyber neon aesthetic, gamified, blue color palette, futuristic, techy, engaging, 1920x1080p resolution, high quality, should not contain any text or logos, and can be used as game background image for logic circuit game, with no copyright issues, and with no edges that will make it obvious that it is tiled, seamless pattern, abstract, 3d rendering, can be used for both mobile and desktop view, has a text "Logic Play", and is minimal, techy, modern, and engaging, abstract, futuristic, 4k resolution, 3d rendering, no copyright issues, for both mobile and desktop)

- for this game craft a prompt to generate an icon for the game (cyber neon aesthetic, gamified, blue color palette, futuristic, techy, engaging, 4k resolution, high quality, should not contain any text or logos, and can be used as game icon for logic circuit game, with no copyright issues, abstract, 3d rendering, minimal, logo should be 512x512 pixels, no copyright issues, has a text "Logic Play", and is minimal, techy, modern, and engaging, abstract, futuristic, 4k resolution, 3d rendering, no copyright issues, for both mobile and desktop)

- for this game, craft a prompt to generate a sprite for the game (humanoid, can be customized for gender, or can be a robot, this sprite will be available always via a button in the settings) (cyber neon aesthetic, gamified, blue color palette, futuristic, techy, engaging, 4k resolution, high quality, should not contain any text or logos, and can be used as game sprite for logic circuit game, with no copyright issues, abstract, 3d rendering, minimal, sprite should be 512x512 pixels, no copyright issues, has a text "Logic Play", and is minimal, techy, modern, and engaging, abstract, futuristic, 4k resolution, 3d rendering, no copyright issues, for both mobile and desktop)



==================================================================

NEXT STEPS:
- Implement final API logic listed on the backend roadmap.
- Continue checking off backend features.
