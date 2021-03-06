import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import MeshDrawable from './geometry/MeshDrawable';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './LSystem';
//import * as OBJ from 'webgl-obj-loader';
import * as fs from 'fs';
import DrawableRule from './DrawableRule';

var OBJ = require('webgl-obj-loader');
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  axiom: 'C',
  mode: 'random',
  tesselations: 5,
  spread: 60,
  iter: 0,
  density:100,
  'Load Scene': loadScene, // A function pointer, essentially
  //'test' : test, 
  color: [255.0,255.0,255.0,1.0],
}; 

let icosphere: Icosphere;
let square: Square;
// let cube: Cube;
let meshOBJ: any;
let mesh: MeshDrawable;

let flower:MeshDrawable;
let lsystem: LSystem;

//let mesh: OBJ.Mesh;




function loadScene() {
  mesh = new MeshDrawable(vec3.fromValues(0,0,0));
  mesh.initMesh('no');
  // lsystem = new LSystem(controls.axiom, mesh, flower, controls.spread);
  // lsystem.spread = controls.spread;

  var dR = new DrawableRule(controls.axiom, mesh);
  dR.density = controls.density;
  dR.mode = controls.mode;
  
  //dR.initializeShapes(controls.axiom);
  //dR.drawIter(1);
  dR.drawCity();
  dR.drawIter(controls.iter);

  mesh.createMesh();

  square = new Square(vec3.fromValues(0,0,0));
  square.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'density', 100, 300).step(10);
  gui.add(controls, 'iter', 0, 4).step(1);
  gui.add(controls, 'Load Scene');
  // Choose from accepted values
  gui.add(controls, 'mode', [ 'random', 'radial'] );
  // gui.add(controls, 'axiom');
  //gui.add(controls, 'test');
  gui.addColor(controls, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }

  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 100, 100), vec3.fromValues(0, 0, 45));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);


  let currColor: vec4;
  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    currColor = vec4.fromValues(controls.color[0] / 255.0, controls.color[1] / 255.0, controls.color[2] / 255.0, controls.color[3]);
    lambert.setGeometryColor(currColor);
    renderer.render(camera, lambert, [
      mesh,
      // flower,
      square,
      //cube,
    ]);

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  //setGeometryColor(color: vec4)

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
