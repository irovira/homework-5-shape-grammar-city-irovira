import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import LSystem from '../LSystem';
import * as fs from 'fs';
var OBJ = require('webgl-obj-loader');

var currentMesh: any;
class MeshDrawable extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  currIndices: Array<number>;
  currPositions: Array<number>;
  currNormals: Array<number>;

  baseIndices: Array<number>;
  basePositions: Array<number>;
  baseNormals: Array<number>;
  center: vec4;


  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.isMesh = true;
    this.currIndices = new Array();
    this.currPositions = new Array();
    this.currNormals = new Array();

    this.baseNormals = new Array();

    this.baseIndices = new Array();
    this.basePositions = new Array();

    //this.baseNormals = new Array();

    
  }

  initMesh(name:string){
    if(name == 'no'){
      debugger;
    } else {
    var objStr = document.getElementById(name).innerHTML;
    var opt = { encoding: 'utf8' };
      debugger;
    var mesh = new OBJ.Mesh(objStr);
    // OBJ.initMeshBuffers(gl, mesh);
    
    currentMesh = mesh;
    //this.positions = new Float32Array(currentMesh.vertices); 
    
    //append 1
    var posSize = (currentMesh.vertices.length / 3) * 4;
    var newPosInd = 0;
    for(var i = 0; i < currentMesh.vertices.length; i = i+3 ){
      this.basePositions[newPosInd] = currentMesh.vertices[i];
      this.basePositions[newPosInd+1] = currentMesh.vertices[i+1];
      this.basePositions[newPosInd+2] = currentMesh.vertices[i+2];
      this.basePositions[newPosInd+3] = 1.0;
      newPosInd = newPosInd + 4;
    }
    //this.positions = new Float32Array(this.currPositions);
    //console.log(currentMesh.vertices);
    //console.log(this.currPositions);


     //append 0
    var norSize = (currentMesh.vertexNormals.length / 3) * 4;
    var newNorInd = 0;
    for(var i = 0; i < currentMesh.vertexNormals.length; i = i+3 ){
      this.baseNormals[newNorInd] = currentMesh.vertexNormals[i];
      this.baseNormals[newNorInd+1] = currentMesh.vertexNormals[i+1];
      this.baseNormals[newNorInd+2] = currentMesh.vertexNormals[i+2];
      this.baseNormals[newNorInd+3] = 0.0;
      newNorInd = newNorInd + 4;
    }
    //this.normals = new Float32Array(this.currNormals);
    
    this.baseIndices = currentMesh.indices;
    debugger;
    //this.indices = new Uint32Array(currentMesh.indices);
    
    //console.log(currentMesh.indices.length);
    //console.log(mesh.normalBuffer.numItems);
    }
  }

  createMesh() {

    this.positions = new Float32Array(this.currPositions);
    this.normals = new Float32Array(this.currNormals);
    this.indices = new Uint32Array(this.currIndices);
    debugger;


    this.generateIdx();
    this.generatePos();
    this.generateNor();


    this.count = this.indices.length;

    
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER,this.normals, gl.STATIC_DRAW);


    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);



    console.log(`Created mesh`);
  }

  appendPos(pos:Array<number>){
    this.currPositions = this.currPositions.concat(pos);

  }

  appendInd(ind:Array<number>){

    this.currIndices = this.currIndices.concat(ind);

  }

  appendNor(nor:Array<number>){
    this.currNormals = this.currNormals.concat(nor);
    debugger;
  }

  scaleMesh(num:number){
    //ONLY USE FOR FLOWER
    var s = vec3.fromValues(num,num,num);
    var mat = mat4.create()
    mat = mat4.fromScaling(mat,s);

    for(var i = 0;i < this.currPositions.length;i = i + 4){
      //positions
      var pos = vec4.fromValues(this.currPositions[i], this.currPositions[i+1], this.currPositions[i+2], this.currPositions[i+3]);
      pos = vec4.transformMat4(pos,pos,mat);
      this.currPositions[i] = pos[0];
      this.currPositions[i+1] = pos[1];
      this.currPositions[i+2] = pos[2];
      this.currPositions[i+3] = pos[3];

      //this.positions = this.currPositions.concat(pos[0], pos[1], pos[2],pos[3]);

      // //normals
      var nor = vec4.fromValues(this.currNormals[i], this.currNormals[i+1], this.currNormals[i+2], this.currNormals[i+3]);
      nor = vec4.transformMat4(nor,nor,mat);
      this.currNormals[i] = nor[0];
      this.currNormals[i+1] = nor[1];
      this.currNormals[i+2] = nor[2];
      this.currNormals[i+3] = nor[3];
    }

  }

  create(){}
};

export default MeshDrawable;