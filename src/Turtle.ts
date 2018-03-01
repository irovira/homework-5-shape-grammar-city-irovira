
import {vec3, vec4, mat3, mat4,quat} from 'gl-matrix';
import * as fs from 'fs';
var OBJ = require('webgl-obj-loader');
//Fractal Plant rules referenced from: https://en.wikipedia.org/wiki/L-system
//(X → F[−X][X]F[−X]+FX), (F → FF)
class Stack{
    items: Turtle[];
    constructor(){
        this.items = [];
    }

    push(t: Turtle){
        this.items.push(t);
    }
    pop(): Turtle{
        return this.items.pop();
    }
    peek(): Turtle{
        return this.items[this.items.length - 1];
    }
    isEmpty(): boolean{
        return this.items.length === 0;
    }
    // printStack()
}


class Turtle {
  controls: any;
  baseIndices: Array<number>;
  basePositions: Array<number>;
  baseNormals: Array<number>;

  flowerIndices: Array<number>;
  flowerPositions: Array<number>;
  flowerNormals: Array<number>;
  flowerSize:number;
  flowerInd:number;

  positions: Array<number>;
  normals: Array<number>;
  indices: Array<number>;
  
  iter: number;
  size:number;
  index:number;
  

  pos:vec3;
  orientation:vec3;
  rot:quat;
  s: vec3;
  rotTransMat:mat4;

  posStack:Array<vec3>;
  rotStack:Array<quat>;
  scaleStack:Array<vec3>;
  orientationStack:Array<vec3>;
  matStack:Array<mat4>;

  fPosStack:Array<vec3>;
  fRotStack:Array<quat>;
  fOrientationStack:Array<vec3>;
  fMatStack:Array<mat4>;



  turtleStack: Stack;
  
  constructor(pos: Array<number>, normals:Array<number>, indices: Array<number>) {
    this.basePositions = pos;
    this.baseNormals = normals;
    this.baseIndices = indices;
    this.turtleStack = new Stack();

    this.positions = new Array<number>();
    this.normals = new Array<number>();
    this.indices = new Array<number>();
    this.iter = 1;
    this.size = this.basePositions.length;
    this.index = this.baseIndices.length;

    this.pos = vec3.create();
    this.orientation = vec3.fromValues(0,1,0);
    this.rot = quat.create();
    this.rotTransMat = mat4.create();
    this.s = vec3.fromValues(1,1,1);
    
    //this.rotTransMat = mat4.fromRotationTranslation(this.rotTransMat, this.rot,this.pos);

    this.posStack = new Array<vec3>();
    this.rotStack = new Array<quat>();
    this.orientationStack = new Array<vec3>();
    this.matStack = new Array<mat4>();
    this.scaleStack = new Array<vec3>();

    this.fPosStack = new Array<vec3>();
    this.fRotStack = new Array<quat>();
    this.fOrientationStack = new Array<vec3>();
    this.fMatStack = new Array<mat4>();

    

  }

  initFlower(pos: Array<number>, normals:Array<number>, indices: Array<number>) {

    this.flowerIndices = indices;
    this.flowerPositions = pos;
    this.flowerNormals = normals;

    this.flowerSize = this.flowerPositions.length;
    this.flowerInd = this.flowerIndices.length;

  }

  rotate(rot:quat){
    //mat4.multiply(this.rotation, this.rotation,rot);
    this.rot = quat.multiply(this.rot, this.rot, rot);
    var m = mat3.create();
    mat3.fromQuat(m,rot);
    this.orientation = vec3.transformMat3(this.orientation,this.orientation,m);
    vec3.normalize(this.orientation,this.orientation);
    this.rotTransMat = mat4.fromRotationTranslationScale(this.rotTransMat, this.rot,this.pos,this.s);
    //var m = mat4.create();
    //mat4.fromQuat(m,rot);
    //fromRotationTranslation(m, rot, translation) 
    //this.rotTransMat = mat4.multiply(this.rotTransMat, this.rotTransMat,m);
    this.draw();
  }

  move(dir:vec3){
    var weh = vec3.fromValues(this.orientation[0],this.orientation[1],this.orientation[2]);
    vec3.scale(weh,weh,3);
    vec3.multiply(weh,weh,this.s);
    // var translation = vec3.create();
    // vec3.multiply(translation, dir, weh);
    
    this.pos = vec3.add(this.pos, this.pos, weh);

    this.rotTransMat = mat4.fromRotationTranslationScale(this.rotTransMat, this.rot,this.pos,this.s);

    // var m = mat4.create();
    // mat4.translate (m, m, translation);
    
    // this.rotTransMat = mat4.multiply(this.rotTransMat, this.rotTransMat,m);

    this.draw();
  }

  moveOnly(){
    var weh = vec3.fromValues(this.orientation[0],this.orientation[1],this.orientation[2]);
    vec3.scale(weh,weh,2);
    vec3.multiply(weh,weh,this.s);
    // var translation = vec3.create();
    // vec3.multiply(translation, dir, weh);
    
    this.pos = vec3.add(this.pos, this.pos, weh);

    this.rotTransMat = mat4.fromRotationTranslationScale(this.rotTransMat, this.rot,this.pos,this.s);

    // var m = mat4.create();
    // mat4.translate (m, m, translation);
    
    // this.rotTransMat = mat4.multiply(this.rotTransMat, this.rotTransMat,m);

    //this.draw();
  }

  scale(s:vec3){

    this.s = vec3.fromValues(this.s[0]* 0.75, this.s[1] * 0.75, this.s[2]* 0.75);

    this.rotTransMat = mat4.fromRotationTranslationScale(this.rotTransMat, this.rot, this.pos, this.s);

    this.draw();
  }

  scaleOnly(){

    this.s = vec3.fromValues(this.s[0]* 0.3, this.s[1] * 0.5, this.s[2]* 0.3);

    this.rotTransMat = mat4.fromRotationTranslationScale(this.rotTransMat, this.rot, this.pos, this.s);
  }

  push(){

    //var t = new Turtle(this.basePositions, this.baseNormals, this.baseIndices);
    var pRot = quat.create();
    quat.copy(pRot,this.rot);
    this.rotStack.push(pRot);

    var pPos = vec3.create();
    vec3.copy(pPos,this.pos);
    this.posStack.push(pPos);

    var pScale = vec3.create();
    vec3.copy(pScale,this.s);
    this.scaleStack.push(pScale);

    var pOr = vec3.create();
    pOr = vec3.copy(pOr, this.orientation);
    this.orientationStack.push(pOr);

    var mat = mat4.create();
    mat4.copy(mat, this.rotTransMat);
    this.matStack.push(mat);

  }

  pop(){

    this.rot = quat.copy(this.rot,this.rotStack.pop());
    this.pos = vec3.copy(this.pos,this.posStack.pop());
    this.orientation = vec3.copy(this.orientation, this.orientationStack.pop());
    this.rotTransMat = mat4.copy(this.rotTransMat,this.matStack.pop());
    this.s = vec3.copy(this.s,this.scaleStack.pop());
  }

  draw(){
    for(var i = 0;i < this.size;i = i + 4){
      //positions
      var pos = vec4.fromValues(this.basePositions[i], this.basePositions[i+1], this.basePositions[i+2], this.basePositions[i+3]);
      pos = vec4.transformMat4(pos,pos,this.rotTransMat);


      this.positions = this.positions.concat(pos[0], pos[1], pos[2],pos[3]);

      // //normals
      var nor = vec4.fromValues(this.baseNormals[i], this.baseNormals[i+1], this.baseNormals[i+2], this.baseNormals[i+3]);
      nor = vec4.transformMat4(nor, nor,this.rotTransMat);

      this.normals = this.normals.concat(nor[0], nor[1], nor[2],nor[3]);
    }

    var offset = Math.floor(this.positions.length / 4.0);
    for(var j = 0;j < this.index; j++){
      // //indices
      
      this.baseIndices[j] = this.baseIndices[j] + offset;
      this.indices.push(this.baseIndices[j]);
    }
  }

  drawFlower(){
    //tried to get another obj to load :( but failed
    // var weh = vec3.fromValues(this.orientation[0],this.orientation[1],this.orientation[2]);
    // vec3.scale(weh,weh,3.0);
    // // // var translation = vec3.create();
    // // // vec3.multiply(translation, dir, weh);
    // var tempPos = vec3.create();
    // var currPos = vec3.create();
    // vec3.copy(currPos, this.pos);
    // vec3.add(tempPos, currPos, weh);

    // var tempRot = quat.create();
    // quat.copy(tempRot, this.rot);

    // var tempScale = vec3.fromValues(1,1,1);

    // var tempMat = mat4.create();
    // mat4.fromRotationTranslationScale(tempMat, tempRot,tempPos,tempScale);

    // this.fPosStack.push(tempPos);
    // this.fRotStack.push(tempRot);
    // this.fMatStack.push(tempMat);

    // for(var i = 0;i < this.flowerSize;i = i + 4){
    //   //positions
    //   var pos = vec4.fromValues(this.flowerPositions[i], this.flowerPositions[i+1], this.flowerPositions[i+2], this.flowerPositions[i+3]);
    //   pos = vec4.transformMat4(pos,pos,tempMat);


    //   this.positions = this.positions.concat(pos[0], pos[1], pos[2],pos[3]);

    //   // //normals
    //   var nor = vec4.fromValues(this.flowerNormals[i], this.flowerNormals[i+1], this.flowerNormals[i+2], this.flowerNormals[i+3]);
    //   nor = vec4.transformMat4(nor, nor,tempMat);

    //   this.normals = this.normals.concat(nor[0], nor[1], nor[2],nor[3]);
    // }

    // var offset = Math.floor(this.positions.length / 4.0);
    // var f = Math.floor(this.flowerPositions.length)
    // for(var j = 0;j < this.flowerInd; j++){
    //   // //indices
      
    //   this.flowerIndices[j] = this.flowerIndices[j] + offset;
    //   this.indices.push(this.flowerIndices[j]);
    // }
  }



  update() {
    this.controls.tick();
  }


};

export default Turtle;