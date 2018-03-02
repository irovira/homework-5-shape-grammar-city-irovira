import * as CameraControls from '3d-view-controls';
import {vec3,vec4, mat4, quat} from 'gl-matrix';
import Turtle from './Turtle';
import MeshDrawable from './geometry/MeshDrawable';
import * as fs from 'fs';
var OBJ = require('webgl-obj-loader');

//Fractal Plant rules referenced from: https://en.wikipedia.org/wiki/L-system
//(X → F[−X][X]F[−X]+FX), (F → FF)
//var fnMap = newLocal
const degree = Math.PI / 180.0;
class Shape {
  symbol:string;
  geo:MeshDrawable;
  position:vec3;
  rotation:vec3;
  scale:vec3;
  terminal:boolean;
  
  constructor(symbol: string, geo:MeshDrawable, position: vec3, rotation:vec3, scale:vec3, terminal:boolean){
    this.symbol = symbol;
    this.geo = geo;
    this.position = vec3.create();
    vec3.copy(this.position,position);
    this.rotation = vec3.create();
    vec3.copy(this.rotation,rotation);
    this.scale = vec3.create();
    vec3.copy(this.scale,scale);
    this.terminal = terminal;
    
  }

}
class DrawableRule {
  controls: any;
  instructions: string;
  fnMap: any;

  baseIndices: Uint32Array;
  basePositions: Float32Array;
  baseNormals: Float32Array;


  positions: Array<number>;
  normals: Array<number>;
  indices: Array<number>;


  turtle: Turtle;
  mesh:MeshDrawable;

  cube:MeshDrawable;
  sphere:MeshDrawable;
  branch:MeshDrawable;
  
  spread:number;

  flowerIndices: Uint32Array;
  flowerPositions: Float32Array;
  flowerNormals: Float32Array;

  shapes:Set<Shape>;

  
  constructor(instructions: string, mesh:MeshDrawable) {
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
    this.LoadShapes();
    // this.cube = mesh;
    // this.sphere = mesh;
    
    this.basePositions = new Float32Array(mesh.basePositions);
    this.baseNormals = new Float32Array(mesh.baseNormals);
    this.baseIndices = new Uint32Array(mesh.baseIndices);

    this.positions = new Array<number>();
    this.normals = new Array<number>();
    this.indices = new Array<number>();

    //console.log(this.baseIndices.toString());
    //this.turtle = new Turtle(mesh.currPositions, mesh.currNormals, mesh.currIndices);
    //this.turtle.initFlower(flower.currPositions, flower.currNormals, flower.currIndices);

    this.shapes = new Set<Shape>();
  }

  LoadShapes(){
    //cube
    this.cube = new MeshDrawable(vec3.fromValues(0,0,0));
    this.cube.initMesh('cube.obj');
    //sphere
    this.sphere = new MeshDrawable(vec3.fromValues(0,0,0));
    this.sphere.initMesh('roof.obj');
    //branches
    this.branch = new MeshDrawable(vec3.fromValues(0,0,0));
    this.branch.initMesh('branch.obj');

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
    debugger;
    return this.positions;
  }

  getNor() : Array<number>{
    return this.normals;
  }

  getInd() : Array<number>{
    debugger;
    return this.indices;
  }

  // A= " [&FFFA] //// [&FFFA] //// [&FFFA].
//" scale branch length
//& Pitch up : (z axis)
// / : roll counterclockwise (y axis)
  move(v:vec3) : vec3{
    var weh = vec3.fromValues(0,3,0);   
    v = vec3.add(v, v, weh);
    return v;
  }


  applyRandomRule(shape:Shape) : Set<Shape> {
    var set = new Set<Shape>();
    if(shape.symbol == 'cube'){
      //spire rule
      var pos = vec3.create();
      vec3.copy(pos, shape.position);
      

      var rot = vec3.create();
      vec3.copy(rot, shape.rotation);

      var scale = vec3.create();
      vec3.copy(scale, shape.scale);
      var newShape = new Shape('branch', this.branch, pos, rot, scale, true);
      set.add(newShape);

      var weh = vec3.fromValues(0,3,0);   
      pos = vec3.add(pos, pos, weh);
      var newShape = new Shape('sphere', this.sphere, pos, rot, scale, true);
      set.add(newShape);
    }
    //dome rule
    // var pos = vec3.create();
    //   vec3.copy(pos, shape.position);
      

    //   var rot = vec3.create();
    //   vec3.copy(rot, shape.rotation);

    //   var scale = vec3.create();
    //   vec3.copy(scale, shape.scale);
    //   var newShape = new Shape('branch', this.branch, pos, rot, scale, true);
    //   set.add(newShape);

    //   pos = this.move(pos);
    //   var newShape = new Shape('sphere', this.sphere, pos, rot, scale, true);
    //   set.add(newShape);
    return set;
  }

  initializeShapes(s:string){
    for(var i = 0; i < s.length; i++){
      var rule = s.charAt(i).toString();
      if(rule == 'C'){
        var pos = vec3.fromValues(0,0,0);
        var rot = vec3.fromValues(0,0,0); //rotation is in degrees :/
        var scale = vec3.fromValues(1,1,1);
        //debugger;
        var newShape = new Shape('cube', this.cube, pos, rot, scale, false);
        this.shapes.add(newShape);
      }
    }
  }

  drawIter(iter:number){
    // debugger;
    for(var i = 0; i < iter; i++){
      var successors = new Set<Shape>();
      for(let s of this.shapes){
        
        if(!s.terminal){
            successors = this.applyRandomRule(s);
            // debugger;
            this.shapes.delete(s);
            //t.forEach(s.add, s);     
        }
         // append new set to 
      }
      successors.forEach(this.shapes.add,this.shapes);
    }
    debugger;
    this.drawShapes();
  }

  drawShapes(){
    debugger;
    var baseIndices = Array<number>();
    var basePositions = Array<number>();
    var baseNormals = Array<number>();
    var transMat = mat4.create();
    var q = quat.create();
    for(let s of this.shapes){
      
      quat.fromEuler(q, s.rotation[0],s.rotation[1],s.rotation[2]);
      mat4.fromRotationTranslationScale(transMat, q, s.position, s.scale);

      baseIndices = s.geo.baseIndices;
      basePositions = s.geo.basePositions;
      baseNormals = s.geo.baseNormals;
      debugger;
      var offset = Math.floor(this.positions.length / 4.0);
      for(var j = 0;j < baseIndices.length; j++){
        //indices
        
        // this.baseIndices[j] = baseIndices[j] + offset;
        this.indices.push(baseIndices[j] + offset);
      }

      for(var i = 0;i < basePositions.length;i = i + 4){
        //positions
        var pos = vec4.fromValues(basePositions[i], basePositions[i+1], basePositions[i+2], basePositions[i+3]);
        pos = vec4.transformMat4(pos,pos,transMat);
  
  
        this.positions = this.positions.concat(pos[0], pos[1], pos[2],pos[3]);
  
        // //normals
        var nor = vec4.fromValues(baseNormals[i], baseNormals[i+1], baseNormals[i+2], baseNormals[i+3]);
        nor = vec4.transformMat4(nor, nor,transMat);
  
        this.normals = this.normals.concat(nor[0], nor[1], nor[2],nor[3]);
      }
  
      
    }
    // debugger;
    this.mesh.appendInd(this.getInd());
    this.mesh.appendPos(this.getPos());
    this.mesh.appendNor(this.getNor());
  }

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