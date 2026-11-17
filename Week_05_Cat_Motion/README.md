# Week 5 — Cat Motion

**Li Jiaqi | DM3014 Interactive Devices**

## Concept

Cat Motion is my version of the Week 5 Webcam Drawing exercise. I used a photo of my own cat because I like cats and thought it would be cute to fill the screen with lots of little cats. I wanted to make the original movement drawing exercise feel more playful and personal.

## Interaction

The webcam detects movement and places cat images where movement happens. The cats slowly fade away when I stop moving. I can adjust the cat size, spacing, and motion threshold using sliders. Stronger movement changes the colour slightly from lavender towards pink. There are also Clear, Debug, and Full screen options.

## How It Works

The sketch uses p5.js and frame differencing. It compares the current webcam image with the previous frame to find areas that have changed. These areas activate cat images on a grid. The video is mirrored, and the motion positions are mapped to the displayed image. Each cat fades based on the time since movement was detected.

## Changes from the Classroom Example

Ashley's original `5_webcamDrawing` example already included webcam capture, frame-difference motion detection, a grid of points, threshold adjustment, and fading points. I kept that basic idea but changed the output from gold circles to my own cat photo. The updated version also uses a responsive canvas, larger and more widely spaced images, sliders for size, spacing, and sensitivity, a subtle movement-based colour change, and buttons for clearing and viewing the drawing. I also improved the mirrored camera-to-screen mapping and changed the fading to use elapsed time.

## Testing and Reflection

I tested this version and the main interaction works. My favourite part is seeing lots of cats appear when I move. The controls let me try different sizes and densities without editing the code each time.

One limitation is that this is motion detection, not hand tracking. Changes in lighting or movement in the background can also trigger the images. If I continue the project, I would like to make the detection more consistent in different lighting conditions.

## How to Run

1. Keep `index.html`, `sketch.js`, `img.png`, and the `vendor` folder together.
2. Open the folder through a local server, such as VS Code Live Server, or run `python3 -m http.server 8000` in the project folder.
3. Open the local page in a browser, click **Start camera**, and allow camera access.
4. Move in front of the camera. Adjust the sliders to change the result. Press **H** to hide or show the controls.

## Documentation

Documentation is not included yet. After recording, add a short video of movement creating cat images and a screenshot of the result to the `documentation` folder.

## Credits

- Classroom starter: Ashley Hi, DM3014 Interactive Devices, Week 5 — `5_webcamDrawing`.
- Cat photograph: my own photo.
- p5.js: Processing Foundation and contributors, https://p5js.org/. The bundled licence is included in `vendor`.
- The classroom motion-detection method is credited above. The cat-image adaptation and visual/interface changes were developed for this portfolio version, with ChatGPT assistance during code refinement and documentation.
