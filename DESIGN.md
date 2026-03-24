# Design System Document

## 1. Overview & Creative North Star: "The Analog Press"
This design system is a digital homage to the tactile, salt-stained world of 1960s surf culture and the precision of custom board shaping. Moving away from the generic "startup" aesthetic, this system adopts an editorial posture. 

The **Creative North Star** is **"The Analog Press."** Think of a high-end, limited-run photography book or a vintage surf zine printed on heavy matte stock. It is characterized by high-contrast monochromatic scales, intentional asymmetry that mimics a physical layout, and a rejection of standard UI "safety" features like rounded corners and heavy drop shadows. Every pixel should feel like it was placed with the same intent a shaper uses with a planer on a foam blank.

---

### 2. Colors: High-Contrast Monochromatics
The palette is strictly restricted to black, white, and varying atmospheric grays. This creates a focused environment where the photography of the surfboards becomes the hero.

*   **Primary (`#000000`):** Used for the most critical actions and heavy editorial headlines. It represents the "ink" of the system.
*   **Surface Hierarchy (`#f9f9f9` to `#eeeeee`):** The background logic moves from the off-white paper feel of `surface` to the deeper tones of `surface-container-high`.
*   **The "No-Line" Rule:** To maintain a premium editorial feel, 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (`#f3f3f3`) section should sit flush against a `surface` (`#f9f9f9`) background to create a "block" effect without the clutter of lines.
*   **Surface Nesting:** Treat the UI as stacked sheets of fine paper. A card should be `surface-container-lowest` (`#ffffff`) placed upon a `surface-container` (`#eeeeee`) section. This creates "soft depth" through tonal contrast rather than structural ornamentation.
*   **The Glass & Resin Rule:** To mimic the finish of a glassed surfboard, use Glassmorphism for floating navigation or overlays. Use `surface` at 80% opacity with a high `backdrop-blur` (20px+) to allow background textures and grain to bleed through.

---

### 3. Typography: The Editorial Mix
Typography is the voice of this system. It balances the "Old World" craftsmanship of a serif with the "Functionalist" clarity of a sans-serif.

*   **Display & Headlines (Newsreader):** This serif font is our "Title Sequence." Use `display-lg` (3.5rem) with tight letter spacing for hero sections to create a bold, cinematic impact. Its classic proportions evoke heritage and authority.
*   **Body & Titles (Work Sans):** Our workhorse. It provides a clean, modern counterpoint. Use `body-lg` for long-form descriptions of board rails and rockers. 
*   **Labeling & Metadata:** Use `label-sm` in all-caps with increased letter-spacing (0.05em) for technical specs (e.g., "9'6\" NOSERIDER"). This mimics the stamped labels on a shaper's technical sheet.

---

### 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by a system of "Natural Lift."

*   **The Layering Principle:** Depth is achieved by stacking surface-container tiers. Use the highest contrast available between adjacent layers to define shape. 
*   **Ambient Shadows:** If a floating element (like a modal) is required, use an extra-diffused shadow.
    *   *Blur:* 40px
    *   *Opacity:* 6% 
    *   *Color:* Based on `on-surface` (`#1a1c1c`).
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility (e.g., a text input), use a "Ghost Border." Apply `outline-variant` (`#c6c6c6`) at 15% opacity. Never use 100% opaque borders.
*   **Sharpness as Standard:** Following the Roundedness Scale, all elements must have a `0px` radius. Sharp corners convey a professional, custom-tooled feel that differentiates the experience from consumer-grade "bubbly" apps.

---

### 5. Components: Functional Minimalism

*   **Buttons:**
    *   **Primary:** Solid `primary` (`#000000`) background with `on-primary` (`#e2e2e2`) text. Sharp 0px corners. Large horizontal padding (Spacing 6).
    *   **Secondary:** `surface` background with a 1px "Ghost Border" (15% opacity `outline`).
    *   **Tertiary:** Underlined `label-md` text; no background.
*   **Inputs:**
    *   Use `surface-container-low` background with a bottom-only border in `outline`. This mimics a signature line on a custom order form.
*   **Cards:**
    *   Forbid dividers. Separate content using Spacing 5 or 8. Use `surface-container-lowest` to make cards "pop" off a gray background.
*   **The "Shaper’s Spec" Component:**
    *   A unique component for board dimensions. Use a vertical grid with `label-sm` headers and `headline-sm` values. Separate columns with vertical white space, never lines.
*   **Grain Overlay:**
    *   Apply a global, low-opacity (3%) noise texture overlay to the entire UI to achieve the "vintage surf culture" feel. This softens the digital "flatness" and adds a tactile quality.

---

### 6. Do’s and Don’ts

**Do:**
*   **Do** use asymmetrical layouts. Place a large `display-lg` headline off-center to create visual tension.
*   **Do** use extreme white space. Let the "paper" breathe.
*   **Do** use high-grain, black-and-white photography with deep blacks and blown-out whites.

**Don’t:**
*   **Don’t** use any color outside the provided grayscale (except for `error` states).
*   **Don’t** add even a 1px border radius. Sharpness is non-negotiable.
*   **Don’t** use standard "Drop Shadows." If it looks like it's hovering, it should be because of a background color shift or an ambient, barely-visible blur.
*   **Don’t** use divider lines to separate list items. Use the spacing scale (`3.5rem`) to create separation.

---

### 7. Spacing Scale Implementation
Spacing must be rhythmic and generous. Use `Spacing 10` (3.5rem) and `Spacing 16` (5.5rem) as your primary layout margins to reinforce the "High-End Editorial" feel. Smaller spacing (0.7rem to 1rem) should be reserved for tight clusters of technical data.