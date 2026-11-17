# Minecraft-Inspired Phone Remote

**Course:** DM3014 Interactive Devices  
**Assignment:** Week 4 — Phone Remote / Handoff  
**Author:** Li Jiaqi

## Concept

I turned the phone-to-laptop remote control exercise into a three-section, side-scrolling Minecraft-inspired platform game. The phone becomes a physical controller: tilting it left and right moves Steve on the laptop screen, and tapping makes him jump. The aim is to move to the right through three connected sections and collect all three emeralds. I chose the Minecraft theme because I enjoy the game and wanted the movement to feel more playful than a basic control test.

## Interaction

- **Phone:** tilt left/right to move Steve; tap to jump.
- **Laptop:** watch Steve move between platforms and collect three emeralds along the map.
- **Feedback:** each emerald plays a sound, and short original jump and landing sounds respond to movement. Collecting all three shows a centered completion panel without overlapping the HUD.
- **Restart:** click Restart on the laptop or press R; arrow keys and Space can be used for testing.

## How it works

`public/phone.js` reads the phone's orientation (`gamma`) and sends horizontal input through Socket.IO. `server.js` relays valid input to the laptop browser. `public/laptop.js` uses p5.js to draw the game and update movement, gravity, collisions, camera scrolling and the collectibles. The server uses HTTPS because phone browsers often require a secure context for motion sensors.

## Changes and improvements

Ashley‘s Week 4 starter, *Handoff*, already included a phone browser as a controller, a Node.js / Socket.IO relay, a laptop p5.js platform game with a red square, ground and a platform, and basic movement and jumping. I adapted that starting point into a Minecraft-inspired game with Steve, multiple block platforms, an emerald objective and a success sound. For this portfolio version, I also:

1. Distinguished server connection from actual phone connection and stopped movement when input times out or the phone disconnects.
2. Checked sensor permissions and ignored invalid tilt readings.
3. Changed platform collision so Steve lands only when crossing a platform from above while falling.
4. Added a small success message and Restart option.
5. Kept the original simple JavaScript structure rather than rebuilding the project around a new framework.
6. Removed the distributed private key and certificate; each person generates their own local development certificate.
7. Expanded the single-screen game into three connected sections with a camera that follows Steve to the right, three emeralds and a completion message.
8. Resized the canvas to fill the laptop browser without distorting game assets, preserved Steve’s proportions and cropped transparent padding from the pixel-art images so dirt blocks tile without visible gaps.
9. After reviewing two further test recordings, moved the completion message into a centered panel to avoid overlapping text and the Restart control, and added short original jump and landing sounds without changing the phone controls.

## Reflection

The most interesting part was using the phone as a controller for a different screen. The tilt input feels more physical than keyboard controls. I also learned that a working demonstration needs more than the main interaction: permission requests, disconnections and platform collision can change the experience. I kept the Minecraft visuals simple so that the relationship between the phone's movement and Steve's movement remains easy to understand. After reviewing a test recording, I also corrected the small fixed-size canvas, distorted character image and separated dirt blocks. The longer horizontal map gives the same phone controls more room to be explored without adding complicated new buttons. The later test showed overlapping completion text, which I fixed with a separate finish panel. I chose subtle jump and landing feedback rather than continuous walking audio, so repeated movement does not become distracting.

This assignemnt still requires the phone and laptop to be on the same Wi-Fi, and the first HTTPS connection may show a self-signed certificate warning. Different phones may interpret tilt slightly differently. A future improvement could be an optional calibration button.

## Run locally

1. Install **Node.js 18+** and ensure `openssl` is available.
2. In Terminal, enter the `code` folder and run `npm install`.
3. Create your **own local-only** certificate in that folder:

   ```bash
   openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
   ```

4. Run `npm start`.
5. On the laptop, open the printed `https://localhost:3000/laptop.html` address.
6. On the phone, connected to the **same Wi-Fi**, open the printed `https://YOUR-LAPTOP-IP:3000/phone.html` address. Accept the locally generated certificate only if you trust your own server.
7. Tap **tap to start remote** and allow orientation access. Tilt to move and tap to jump.

If the phone cannot connect, check local network permissions, Wi-Fi client isolation and the computer firewall. Do not upload `key.pem` or `cert.pem` to GitHub. `npm install` creates `node_modules` locally; it should not be committed.

## Documentation

A real demonstration recording and screenshots will be added after testing the updated version on a phone and laptop. The video should show both devices, tilt movement, jumping, all three emerald collections, horizontal camera scrolling and restart.

## Credits

- **Course starter:** Ashley Hi, DM3014 Interactive Devices, Week 4 *Handoff* example. The original supplied the Express / Socket.IO server, phone-to-laptop communication, p5.js red-square platform environment, basic controls, gravity and collision logic. The project builds on that code rather than claiming these foundations as original.
- **Libraries:** p5.js; Express; Socket.IO.
- **Visual and audio assets:** Steve, dirt block and emerald images were found through Google image search for the earlier student version; Google is a search engine, not the original creator or a license. The original source and permission for each image have not been confirmed. The existing `success.wav` also has an unverified source. The new `jump.wav` and `land.wav` were generated specifically for this portfolio revision as original simple synthesized effects, not taken from Minecraft. The project is unofficial and not approved by or associated with Mojang or Microsoft.
- **Project adaptation:** Jiaqi Li — Minecraft-inspired concept, character and platform visuals, emerald collection objective and sound feedback. **Portfolio revisions:** connection and sensor handling, landing collision checks, restart and success feedback, a responsive canvas, image proportion fixes, a scrolling three-section map, and documentation, with code-review and debugging assistance from ChatGPT.

**Audio note:** No original Minecraft music or sound files are redistributed in this project. The jump and landing effects are newly synthesized, and the existing success sound has not yet been source-verified.
