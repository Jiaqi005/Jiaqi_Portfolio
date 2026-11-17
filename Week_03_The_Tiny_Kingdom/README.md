# The Tiny Kingdom

**DM3014 Interactive Devices — Week 3: Net Art / Hyperlink Poetry**  
**Li Jiaqi**

## Concept / Creative Motivation

*The Tiny Kingdom* is a hyperlink-based story inspired by a dream I had. When I woke up, I could only remember a few fragments rather than the whole sequence. I thought this would fit the assignment because a story made of short sentences and scattered clues asks the viewer to connect pieces together, much like trying to remember a dream.

The story follows a narrator who drinks a mysterious potion, shrinks, enters a tiny kingdom, and searches for a legendary key. The adventure moves through strange events before revealing a connection to cats. The slightly scattered arrangement of sentences is intentional: it gives the page a sense of exploration and reflects the fragmented way I remembered the dream.

What interests me most is that the dream feels impossible, but many of its details connect to things I genuinely like in everyday life. Oriental Leaf tea becomes a potion, Minecraft becomes a way to fly, and cats appear in unexpected roles. By linking these fictional moments to real websites and images, I wanted to show how familiar interests can be transformed into dream logic.

## Interaction / Audience Experience

The webpage contains nine short story fragments. Viewers can read them as a loose trail and click each underlined sentence to open a related webpage or image in a separate window. These external pages are clues rather than illustrations placed directly into the story. The viewer moves between the fictional narrative and ordinary online content, gradually making their own connections.

The text is deliberately arranged across the page instead of in one conventional paragraph. The order of the story can still be followed, but the spacing encourages looking around and exploring. After a fragment is clicked, its text changes to a muted colour so the viewer can see which clues they have already visited.

## How It Was Made

I used HTML and CSS to build and style the webpage, and p5.js to create the clickable text links. Each story fragment is stored as an object in the `links` array, with its sentence, destination URL, position, and optional popup dimensions. The `setup()` function creates the links, and `openPopup()` opens the selected destination in a separate browser window.

The starting point was Ashley Week 3 Net Art assignment example, *Sculpture As 100 Hyperlinks*. The original class example already included the `links` array, p5.js `createA()`, positioned links, and popup-window logic.

## My Changes From the Class Example

- Replaced the example's collection of sculpture-related links with an original nine-part story based on my dream.
- Selected external pages and images to act as clues for the potion, flight, guard, key, and cat-related ending.
- Designed the page's typography, soft background gradients, text colours, hover behaviour, and scattered placement of the sentences.
- Added a responsive layout: the spatial composition scales down on medium-sized screens, while narrow screens display the fragments as a readable vertical trail.
- Added reading-progress feedback: clicked sentences change to a softer grey-purple colour during the current visit.
- Used actual destination URLs in the anchor elements while keeping the class example's popup interaction, so the links also have normal link destinations.
- Cleaned up the code header and comments to distinguish the class template from my own work.

## Reflection

I think the most successful part is the relationship between the story and its links. The linked material is not just extra information; it helps turn incomplete dream fragments into a narrative. The mixture of unrelated real-world sources also gives the experience the strange but familiar feeling of a dream.

One challenge was balancing the scattered composition with readability. Fixed positions gave the page its original character, but they did not work well on smaller screens. For the portfolio version, I kept that layout on larger screens and introduced a simpler reading arrangement for narrow screens. The visited-link colour is a small addition that makes exploration easier without telling viewers exactly how to interpret the story.

The experience still depends on external websites, which may change or become unavailable over time. Browsers may also open a new tab instead of a small popup, depending on their settings. If I developed this further, I would explore ways to preserve the clues while keeping the unpredictable feeling of moving between websites.

## How to Run

1. Open `code/The_Tiny_Kingdom.html` in a modern web browser.
2. Connect to the internet: the page loads p5.js from a CDN, and the story clues open external websites.
3. Click the underlined sentences to explore the linked clues. Clicked sentences become muted in colour during the current page visit.
4. If the browser blocks popup windows, allow popups for the page or use the link's normal browser options to open it.

No installation or hardware is required. The page can also be hosted on GitHub Pages.

## Documentation

Add a screenshot of the full page and a short screen recording showing a few links opening and the visited-link colour change to the `documentation/` folder before submission.

## Credits / Attribution

- **Class starter code:** Ashley Hi, DM3014 Interactive Devices, Week 3 Net Art assignment example, *Sculpture As 100 Hyperlinks*. The original link data structure, p5.js link creation and popup approach were supplied in the class example.
- **p5.js:** JavaScript creative-coding library, loaded from cdnjs (version 1.9.4).
- **Story, selection of linked clues, visual design and portfolio modifications:** Jiaqi Li.
- **External content:** All destination pages, images, brands and products belong to their respective creators or owners. They are linked as outside sources, not claimed as original assets. See the URLs in `code/The_Tiny_Kingdom.html` for the individual destinations.
