Context: Act as a Senior Product Designer and Full-Stack Vercel Expert specializing in Next.js, Framer Motion, and Tailwind CSS.

Objective: Build the foundational frontend (PWA) for skim.yt. This is a mobile-first application where users swipe through summaries of YouTube videos. The UI must strictly adhere to a highly polished Apple "Liquid Glass" (Glassmorphism) aesthetic.

Design Requirements (Liquid Glass Vibe):

Overall: Deep black background (bg-black). Use heavy background blurs (backdrop-blur-2xl) and subtle translucent overlays (bg-white/5 or bg-white/10) to create floating panels.

Reflections/Highlights: Use CSS pseudo-elements (::before or ::after) on panels to add subtle diagonal gradients that look like light reflecting off a polished surface.

Shadows: Use massive, diffused shadows (shadow-2xl) to isolate floating elements.

Core Components to Build:

1. The Mobile Layout & Sidebar

Create a full-screen mobile layout. Lock the viewport to prevent standard scrolling.

Header: Top left hamburger menu (Hamburger icon looks like two thin glass lines). Top right user avatar.

Sidebar (Glass Drawer): When opened, the sidebar should be a full-screen pane of frosted glass (backdrop-blur-xl, bg-black/40) sliding over the interface. It contains:

Section: "My Feed"

Section: "Discovery (Trending)"

Section: "Sources" (Include an input field with a liquid glass look to paste YouTube URLs, and a sleek button to "Sync Google subs").

2. The Swipe Deck (Framer Motion)

Implement a stack of 3 swipeable cards using Framer Motion. The interaction must be incredibly smooth and fluid (liquid physics on the spring animation). Left swipe dismisses, right swipe dismisses.

3. The "Skim Card" Component (Liquid Glass Implementation)

The Thumbnail Background: The card's content is displayed over the video thumbnail. Apply a heavy radial black vignette/gradient on top of the thumbnail so it fades to deep black in the center, ensuring text readability.

The Glass Content Panel: A glassy panel (backdrop-blur-lg, border border-white/10, bg-white/5, shadow-2xl) floats over the vignette thumbnail, holding the text.

Content (Minimalist):

Channel Name & Avatar (Top left of panel).

Video Title (Medium size, white).

The Nuggets: An unordered list of 3-5 concise bullet points (the AI summary). Text must be crisp and white.

Action Button: At the bottom center, a sleek button made to look like molded liquid red plastic/glass (YouTube Red hue, translucent, highly reflective) that says "Watch on YouTube."

4. Data Orchestration (Mock)

Do not use a live backend yet. Create a robust mock JSON array of 10 video objects to populate the deck. Include realistic YouTube titles, thumbnails, channel names, and 4-5 fictional, technical "nuggets" for each.

Implement a mock sorting function that performs a "Round-Robin" chronological stack (e.g., if channels are A, B, and C, stack newest A, newest B, newest C, then 2nd newest A, 2nd newest B...).

Please generate the functional code for this complete UI. Start with the Next.js page structure, the Framer Motion swipe logic, and the detailed styling for the Liquid Glass card.
make sure sidebar is not very transparent and background contents do not distract the view. make it a frosted glass kind if possible

in the side bar: add a button and a input field that can add a youtube channel link

