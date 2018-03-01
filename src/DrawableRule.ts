import * as CameraControls from '3d-view-controls';
import {vec3, mat4, quat} from 'gl-matrix';
import Turtle from './Turtle';
import MeshDrawable from './geometry/MeshDrawable';


//Fractal Plant rules referenced from: https://en.wikipedia.org/wiki/L-system
//(X → F[−X][X]F[−X]+FX), (F → FF)
//var fnMap = newLocal
const degree = Math.PI / 180.0;
class DrawableRule {
  controls: any;
  instructions: string;
  fnMap: any;
  baseIndices: Uint32Array;
  basePositions: Float32Array;
  baseNormals: Float32Array;
  turtle: Turtle;
  mesh:MeshDrawable;
  spread:number;

  flowerIndices: Uint32Array;
  flowerPositions: Float32Array;
  flowerNormals: Float32Array;
  
  constructor(instructions: string, mesh:MeshDrawable, flower:MeshDrawable) {
    this.fnMap = {};
    this.spread = 60.0;
    this.instructions = instructions;
    //this.fnMap["X"] = this.X();
    this.fnMap["F"] = this.F;
    this.fnMap["["] = this.push;
    this.fnMap["]"] = this.pop;
    this.fnMap["-"] = this.rotateLeft; //rotate left 25 degrees
    this.fnMap["+"] = this.rotateRight; //rotate right 25 degrees
    this.mesh = mesh;
    
    this.basePositions = new Float32Array(mesh.currPositions);
    this.baseNormals = new Float32Array(mesh.currNormals);
    this.baseIndices = new Uint32Array(mesh.currIndices);

    //console.log(this.baseIndices.toString());
    this.turtle = new Turtle(mesh.currPositions, mesh.currNormals, mesh.currIndices);
    this.turtle.initFlower(flower.currPositions, flower.currNormals, flower.currIndices);
  }



  X(){
    var r = 2;
    //this.turtle.draw();
    //this.turtle.move(vec3.fromValues(1.5,0,0));
    
  }
  F(){
    //console.log('f is called lol');
    this.turtle.move(vec3.fromValues(0,3,0));
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
    
  }
  push(){
    //console.log('push called');
    this.turtle.push();

  }
  pop(){
    //console.log('pop called');
    this.turtle.pop();
    
  }
  rotateLeft(){
    //console.log('rotate left called');
    var rot = quat.create();
    quat.rotateZ(rot,rot,45*degree);
    this.turtle.rotate(rot);
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
    //this.turtle.rotate(rot);
  }
  rotateRight(){
    //console.log('rotate right called');
    var rot = quat.create();
    quat.rotateZ(rot,rot,-45*degree);
    this.turtle.rotate(rot);
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
  }

  pitch(){
    //console.log('rotate left called');
    var rot = quat.create();
    quat.rotateY(rot,rot,-15*degree);
    this.turtle.rotate(rot);
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
    //this.turtle.rotate(rot);
  }

  roll(){
    //console.log('rotate left called');
    var rot = quat.create();
    //console.log(this.spread.toString());
    quat.rotateX(rot,rot,this.spread*degree);
    quat.rotateY(rot,rot,180*degree);
    quat.rotateZ(rot,rot,this.spread*degree);
    
    
    this.turtle.rotate(rot);
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
    //this.turtle.rotate(rot);
  } 

  scale(){
    this.turtle.scale(vec3.fromValues(0,3,0));
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
  }

  drawFlower(){
    // console.log('drawflower called');
    // this.turtle.moveOnly();
    // this.turtle.drawFlower();
    this.turtle.moveOnly();
    this.turtle.scaleOnly();
    
    for(var i = 0; i < 3; i++){
      this.roll();
    }
    // this.mesh.appendInd(this.getInd());
    // this.mesh.appendPos(this.getPos());
    // this.mesh.appendNor(this.getNor());
  }

  getPos() : Array<number>{
    return this.turtle.positions;
  }

  getNor() : Array<number>{
    return this.turtle.normals;
  }

  getInd() : Array<number>{
    return this.turtle.indices;
  }

  // A= " [&FFFA] //// [&FFFA] //// [&FFFA].
//" scale branch length
//& Pitch up : (z axis)
// / : roll counterclockwise (y axis)

  draw(){
    //this.X();
    // this.drawFlower();
    // console.log(this.instructions);
    for(var i = 0; i < this.instructions.length; i++){
      var rule = this.instructions.charAt(i).toString();
      if( rule == 'F'){
        this.F();
      } else if ( rule == 'X'){
        this.X();
      } else if ( rule == '+'){
        this.rotateRight();
      } else if (rule == '-'){
        this.rotateLeft();
      } else if (rule == '&'){
        this.pitch();
      } else if (rule == '/'){
        this.roll();
      } else if (rule == '['){
        this.push();
      } else if (rule == ']'){
        this.pop();
      } else if (rule == '"'){
        this.scale();
      } else if (rule == 'f'){
        this.drawFlower();
      }
      
    }
    // this.F();
    // this.mesh.appendInd(this.getInd());
    // this.mesh.appendPos(this.getPos());
    // this.mesh.appendNor(this.getNor());
    // this.X();
    // this.mesh.appendInd(this.getInd());
    // this.mesh.appendPos(this.getPos());
    // this.mesh.appendNor(this.getNor());
    //this.F();
  }


  update() {
    this.controls.tick();
  }


};

export default DrawableRule;