import * as CameraControls from '3d-view-controls';
import {vec3, vec4, mat4} from 'gl-matrix';
import DrawableRule from './DrawableRule';
import Turtle from './Turtle';
import MeshDrawable from './geometry/MeshDrawable';





//dictionary referenced from KeyCollection Interface at
//https://www.dustinhorne.com/post/2016/06/09/implementing-a-dictionary-in-typescript

// export interface IKeyedCollection<T> {
//     Add(key: string, value: T);
//     ContainsKey(key: string): boolean;
//     Count(): number;
//     Item(key: string): T;
//     Keys(): string[];
//     Remove(key: string): T;
//     Values(): T[];
// }

export class Dictionary {
    private items: { [index: string]: string } = {};
 
    private count: number = 0;

    public Add(key: string, value: string) {
        if(!this.items.hasOwnProperty(key))
             this.count++;
 
        this.items[key] = value;
    }
 
    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }
 
    public Count(): number {
        return this.count;
    }
 
    
 
    public Remove(key: string): string {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }
 
    public Item(key: string): string {
        return this.items[key];
    }
 
    public Keys(): string[] {
        var keySet: string[] = [];
 
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }
 
        return keySet;
    }
 
    public Values(): string[] {
        var values: string[] = [];
 
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }
 
        return values;
    }
}

//Fractal Plant rules referenced from: https://en.wikipedia.org/wiki/L-system
//(X → F[−X][X]F[−X]+FX), (F → FF)
var rulebook = new Dictionary();
//F[+X]F[-X]+X
// rulebook.Add('X','F[−X][X]F[−X]+FX');
// rulebook.Add('X','F[+X]F[-X]+X');

// A= " [&FFFA] //// [&FFFA] //// [&FFFA].
//" scale branch length
//& Pitch up : (z axis)
// / : roll counterclockwise (y axis)

// rulebook.Add('F', 'FF');
//rules  : (1 → 11), (0 → 1[0]0)
// rulebook.Add('F', 'F');
// rulebook.Add('X', 'F[-X]+X');
rulebook.Add('A', '"[&FF[f]F[f]A]////[&FF[f]F[f]A]////[&FF[f]F[f]A]');


class LSystem {
  controls: any;
  currentRule: string;
  mesh: MeshDrawable;
  flower:MeshDrawable;
  center: vec4;
  spread:number;
  //turtle: Turtle;
  constructor(seed: string, mesh: MeshDrawable, flower:MeshDrawable, spread:number) {
      this.currentRule = seed;
      this.mesh = mesh;
      this.flower = flower;
      this.spread = spread;
  }
  
  

expandRule(seed:string): string {
    var curr  = "";
    //console.log('seed is ' + seed);
    for (var i = 0; i < seed.length; i++) {
        console.log(rulebook.ContainsKey(seed.charAt(i).toString()));
        if(rulebook.ContainsKey(seed.charAt(i).toString())){
            //console.log("Contains Key + " + seed.charAt(i).toString());
            curr = curr + rulebook.Item(seed.charAt(i).toString());
        } else {
            curr = curr + seed.charAt(i).toString();
        }
    }
    
    return curr;
}

 expand(iter: number): string{
     //console.log('expand called');
    for(var i = 0; i < iter; i++){
        this.currentRule = this.expandRule(this.currentRule);
    }
    return this.currentRule;
 }

 draw(){
    var dR = new DrawableRule(this.currentRule, this.mesh, this.flower);

    dR.spread = this.spread;
    this.mesh.appendInd(dR.getInd());
    this.mesh.appendPos(dR.getPos());
    this.mesh.appendNor(dR.getNor());
    dR.draw();
    
    
    // dR.draw();

    // this.mesh.appendInd(dR.getInd());
    // this.mesh.appendPos(dR.getPos());
    // this.mesh.appendNor(dR.getNor());

    this.mesh.createMesh();
 }
 

  update() {
    this.controls.tick();
  }
};

export default LSystem;