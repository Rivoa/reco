# Project Blueprint

## Overview

This is an admin dashboard application built with Next.js and Supabase. It provides user authentication and a dashboard with a modern dark theme.

## Features & Design

### Implemented

*   **Authentication:** User login and sign-out functionality using Supabase Auth.
*   **Sidebar Navigation:** A collapsible sidebar for navigating between different sections of the application (Dashboard, Settings).
*   **Database Integration:** Using Supabase for database and authentication.
*   **Responsive Design:** The entire application is designed to be responsive and work seamlessly across different screen sizes, from mobile to desktop. This includes the main layout, dashboard, settings, and login pages.
*   **Dark Theme:** A modern, dark theme has been implemented across the entire application, providing a visually appealing and consistent user experience. The theme uses a custom color palette defined in `globals.css` and `tailwind.config.ts`.

### Current UI/UX Improvement Plan

*   **Modernize the Login Page:**
    *   Create a centered, card-based layout.
    *   Use modern, styled input fields and buttons.
    *   Add the application's name or logo.
    *   Improve visual feedback for user interactions.

*   **Enhance the Dashboard:**
    *   Design a grid-based layout for dashboard widgets.
    *   Create visually distinct cards for key metrics (e.g., "Total Users," "Active Users").
    *   Incorporate icons into the dashboard cards for better visual communication.
    *   Add a welcome message to the user.

*   **Overall Aesthetics:**
    *   Apply a consistent color scheme and typography.
    *   Ensure proper spacing and alignment of UI elements.
    *   Use drop shadows and other effects to create depth and highlight interactive elements.

### Current Plan: Create a Dark Theme

1.  **Define a New Color Palette:**
    *   Create a new dark theme color palette in `src/app/globals.css` using CSS variables.
    *   The palette will include colors for the background, surface, primary and secondary accents, text, and borders.

2.  **Update Tailwind Configuration:**
    *   Update `tailwind.config.ts` to use the new CSS variables, allowing the use of Tailwind's utility classes with the new theme.

3.  **Apply the Theme to the Application:**
    *   Update the root layout (`src/app/layout.tsx`) to use the new background and text colors.
    *   Update the sidebar (`src/components/sidebar.tsx`) to match the new dark theme.
    *   Update the dashboard (`src/app/page.tsx`) to use the new theme for cards, text, and icons.
    *   Update the login page (`src/app/login/page.tsx` and `src/app/login/login-form.tsx`) to match the new theme.
    *   Update the settings page (`src/app/settings/page.tsx`) with the new theme and add a placeholder for future settings.

4.  **Linting and Code Quality:**
    *   Run `npm run lint -- --fix` to ensure the code is clean and follows the project's coding standards.
