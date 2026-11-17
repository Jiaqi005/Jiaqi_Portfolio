# Gesture Bloom

**DM3014 Interactive Devices — Week 6**  
**Li Jiaqi**

## Project idea

Gesture Bloom is a small interactive particle artwork controlled by hand gestures. I wanted to turn a simple image classification exercise into something more visual. Instead of only showing the recognised gesture as text, the particles change their movement depending on what the camera sees.

## How it works

I used a Teachable Machine image model with three labels:

- **Open Hand — Bloom:** the particles spread out from the centre.
- **Fist — Gather:** the particles move closer together.
- **Peace — Orbit:** the particles form three moving rings.

The webcam image is classified with ml5.js, and p5.js draws the particles. I added a confidence threshold and a short check for repeated predictions to make the transitions less jumpy. If the gesture is not recognised consistently, the animation returns to its idle movement.

There are also buttons and keyboard shortcuts (1, 2, 3) to preview the three effects without using the camera. **Preview mode is only for checking the animation; it is not a demonstration of gesture recognition.** Press **H** to hide or show the controls.

## Changes from the weekly example

Ashley's original *Train Your Own Model* example uses a webcam and an image classifier to display the predicted label. I kept that basic idea, but changed the output into a full-screen particle animation. I added three different particle behaviours, colours, a small webcam preview, a status display, and a way to switch between live recognition and visual preview. I also included the model and JavaScript libraries locally so the project files can stay together.

## How to run

1. Keep the `model` and `vendor` folders together with `index.html` and `sketch.js`.
2. Open the `Code` folder in VS Code and launch `index.html` with **Live Server** (or another local HTTP server). Do not open it directly as a `file://` page.
3. Open the page in a browser and click **Start gesture recognition**.
4. Allow camera access and wait for the camera and model to become ready.
5. Show an open hand, fist, or peace sign to change the particles. Good lighting and a clear view of the hand help the model recognise the gesture.

If the camera cannot start, check the browser's camera permission and close other apps using the camera. The **Preview effects** option can still show the particle animations without camera input.

## Reflection

The main challenge was getting the custom model and webcam to load reliably. I also found that the predicted gesture could change quickly between frames, which made the particles switch too suddenly. Checking the confidence and waiting for repeated predictions helped make the interaction feel more stable. The final result is still dependent on lighting and how clearly the hand is shown, but I think it makes the original classification exercise more engaging.

## Files

- `Code/index.html` — page layout and controls
- `Code/sketch.js` — classification and particle animation
- `Code/model/` — exported gesture model
- `Code/vendor/` — local p5.js and ml5.js files, with their licences
- `Code/MODEL_SOURCE.txt` — link to the original model
- `Documentation/` — project demonstration video

## Credits

- **Classroom starting point:** Ashley, DM3014 Week 6, *Train Your Own Model* (p5.js / ml5.js example).
- **Gesture model:** Teachable Machine model used in my project: https://teachablemachine.withgoogle.com/models/P8_RJIyHY/ . The bundled model files are a local copy of this export.
- **Libraries:** p5.js and ml5.js. Their licence files are included in `Code/vendor/`.

The particle behaviours, interface, and changes to the interaction were developed for this portfolio project.
