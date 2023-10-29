//@ts-ignore
import { v4 as uuidv4 } from "uuid";
import { Camera } from "../../parkinglog/Camera";
/***********************************************************
 * Custom PlugIn: DOM Based Particle System
 * Allows you to custom particle system where each particle is
 * its own DOM element, which can have custom CSS applied to
 *
 * Due to browser constraints, this is intended for smaller
 * particle systems, like < 200 particles
 * For larger systems, a canvas based one will be created
 *
 ************************************************************/

/**
 * Types and Interfaces
 */

type ParticleSystemContainType = "hidden" | "visible";
type ParticleStatus = "alive" | "dead";
type EmitterShape = "Point" | "Circle" | "Rect";
type EmitterEmmisionRegion = "Point" | "Area" | "Edge";

// ******************************************************
// the configuration interfaces for creating the classes
// ******************************************************
export interface ParticleConfig {
  width: number;
  height: number;
  angle: number;
  velocity: { x: number; y: number };
  lifespan: number;
  scale: number;
  isVisible: boolean;
  customCSS?: string;
}
export interface EmitterConfig {
  originOffset: { x: number; y: number };
  width: number;
  height: number;
  xposition: number;
  yposition: number;
  angle: number;
  imageSrc?: string;
  isVisible: boolean;
  shape?: EmitterShape; //defaults to Point
  emissionRegion?: EmitterEmmisionRegion;
}
export interface ParticleSystemConfig {
  containtype: ParticleSystemContainType;
  width: number;
  height: number;
  xposition: number;
  yposition: number;
  poolSize: number;
  Camera?: Camera;
}

/**
 * CLASSES!!!
 */

// ******************************************************
// the Particle System
// constructor accepts the ParticleSystemConfig interface
// can support multiple emitters
// particles are owned by the system, not the emitters
// ******************************************************
export class ParticleSystem {
  id: string;
  public template = `
  <style>
    particle-system{
      overflow: \${psystems.containtype};
      font-size: xx-small;
    }
    particle-system,
    particle-emitter,
    part-icle {
      display: block;
      position: absolute;
      background-size: contain;
      image-rendering: pixelated;
    }
    ps-relative,
    em-relative{
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
    }
    particle-emitter,
    part-icle{
        transform-origin: center;
    }

  </style>
    <particle-system style="transform: translate3d(\${psystems.position.x}px,\${psystems.position.y}px,0px); width: \${psystems.size.w}px; height: \${psystems.size.h}px; "> 
        <ps-relative>
            <particle-emitter \${emitter<=*psystems.emitters:id}  style="transform: translate3d(\${emitter.position.x}px,\${emitter.position.y}px,0px) rotate(\${emitter.angle}deg); width: \${emitter.size.w}px; height: \${emitter.size.h}px; border: ; background-image: url(\${emitter.imageSrc});"></particle-emitter>
            <part-icle \${particle<=*psystems.particles:id}   style="top: -\${particle.centerpointY}px; left: -\${particle.centerpointX}px;transform: translate3d(\${particle.xposition}px,\${particle.yposition}px,0px) rotate(\${particle.angle}deg) scale(\${particle.scale}); width: \${particle.width}px; height: \${particle.height}px;  background-image: url(\${particle.imageSrc}); opacity: \${particle.opacity}; display: \${particle.display}; \${particle.customCSS}"></part-icle>
        </ps-relative>
    </particle-system>
  `;
  camera: Camera | undefined;
  containtype: string;
  public emitters: Array<ParticleEmitter>;
  public particles: Array<Particle>;
  public position = { x: 0, y: 0 };
  public size = { w: 0, h: 0 };
  pool: ParticlePool;
  centerpoint = { x: 0, y: 0 };
  isBordershowing = false;

  constructor(config: ParticleSystemConfig) {
    this.pool = new ParticlePool(this, config.poolSize);
    this.id = uuidv4();
    this.containtype = config.containtype;
    this.emitters = [];
    this.particles = [];
    this.position.x = config.xposition;
    this.position.y = config.yposition;
    this.size.w = config.width;
    this.size.h = config.height;
    this.centerpoint.x = this.size.w / 2;
    this.centerpoint.y = this.size.h / 2;
  }

  moveSystem(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }

  startEvent() {}

  createEmitter(this: ParticleSystem, emitterConfig: EmitterConfig) {
    this.emitters.push(new ParticleEmitter(this, emitterConfig));
  }
  destroyEmitter(id: string) {
    const emitterIndex = this.emitters.findIndex(emitter => emitter.id == id);
    if (emitterIndex != -1) this.emitters.splice(emitterIndex, 1);
  }

  update(deltaTime: number, now: number) {
    this.emitters.forEach(emitter => emitter.update(deltaTime));
    this.particles.forEach(particle => particle.update(deltaTime));
  }
}

// ******************************************************
// the Particle Emitter
// constructor accepts the EmitterConfig interface
// only supports the Point shape currently
// this class owns creating/destroying particles
// also, if the particle pool contains particles
// the emitter will reuse a particle stored before it
// creates a new particle
// ******************************************************
export class ParticleEmitter {
  id: string;
  isVisible = true;
  parentSystem: ParticleSystem;
  imageSrc: string;
  position = { x: 0, y: 0 };
  originOffset = { x: 0, y: 0 };
  size = { w: 0, h: 0 };
  radius: number = 0;
  centerpoint = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  rotationalVelocity = 0;
  angle = 0;
  shape: "Point" | "Circle" | "Rect";
  emissionBehavior: EmitterEmmisionRegion = "Point";
  get angleRad() {
    return this.angle * (Math.PI / 180);
  }
  constructor(parent: ParticleSystem, config: EmitterConfig) {
    this.id = uuidv4();
    this.isVisible = config.isVisible;
    this.parentSystem = parent;
    this.position.x = config.xposition;
    this.position.y = config.yposition;
    this.position.y = config.yposition;
    this.size.w = config.width;
    this.size.h = config.height;
    this.centerpoint.x = this.size.w / 2;
    this.centerpoint.y = this.size.h / 2;
    this.originOffset.x = config.originOffset.x;
    this.originOffset.y = config.originOffset.y;
    this.angle = config.angle;
    config.imageSrc ? (this.imageSrc = config.imageSrc) : (this.imageSrc = "");

    //set shape params
    config.shape ? (this.shape = config.shape) : (this.shape = "Point");
    switch (this.shape) {
      case "Point":
      case "Rect":
        this.radius = 0;
        break;
      case "Circle":
        this.radius = Math.min(this.size.w / 2, this.size.h / 2);
        break;
    }

    //set emission behavior
    //if this is Point, its ignored at emission time
    //Edge pushes emissions out to edge of shape
    //Area generates emissions within entire shape randomly
    config.emissionRegion ? (this.emissionBehavior = config.emissionRegion) : (this.emissionBehavior = "Point");
  }

  createParticle(newparticle: ParticleConfig, imageSource?: string): Particle {
    let newPart;
    if (this.parentSystem.pool.pool.length > 0) {
      newPart = this.parentSystem.pool.getParticleFromPool(newparticle);
    } else {
      //@ts-ignore
      imageSource
        ? (newPart = new Particle(this, newparticle as ParticleConfig, imageSource))
        : (newPart = new Particle(this, newparticle as ParticleConfig));
      this.parentSystem.particles.push(newPart as Particle);
    }

    return newPart as Particle;
  }

  setVelocity(vel: { x: number; y: number }) {
    this.velocity.x = vel.x;
    this.velocity.y = vel.y;
  }
  getVelocity() {
    return this.velocity;
  }
  setRotation(rot: number) {
    this.rotationalVelocity = rot;
  }
  getRotation() {
    return this.rotationalVelocity;
  }
  getAngle() {
    return this.angle;
  }

  destroyParticle(id: string) {
    const deadParticle = this.parentSystem.particles.findIndex(particle => particle.id == id);
    if (deadParticle != -1) this.parentSystem.pool.moveToPool(deadParticle);
  }

  update(deltaTime: number) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.angle += this.rotationalVelocity;
  }
}

// ******************************************************
// the Particle class
// constructor accepts the ParticleConfig interface
// this class has an update routine that manages its own
// properties
// if the lifespan of a particle ends, it moves to the particle
// pool for that particle to be reused, and is not rendered
// by the dom (display:none)
// ******************************************************
export class Particle {
  id: string;
  opacity: number;
  isVisible = true;
  static config: ParticleConfig | undefined;
  emitter: ParticleEmitter;
  imageSrc: string;
  xposition = 0;
  yposition = 0;
  centerpointX: number;
  centerpointY: number;
  velocity = { x: 0, y: 0 };
  rotationalVelocity = 0;
  width = 0;
  height = 0;
  angle = 0;
  lifespan = 0;
  scale = 1;
  customCSS: string = "";
  status: ParticleStatus = "alive";
  display: "block" | "none";

  constructor(sourceEmitter: ParticleEmitter, config: ParticleConfig, imagesource?: string) {
    this.id = uuidv4();
    this.isVisible = config.isVisible;
    this.opacity = 1;
    config.customCSS ? (this.customCSS = config.customCSS) : (this.customCSS = "");
    this.emitter = sourceEmitter;
    this.width = config.width;
    this.height = config.height;
    this.centerpointX = this.width / 2;
    this.centerpointY = this.height / 2;
    this.angle = config.angle;
    this.velocity.x = config.velocity.x;
    this.velocity.y = config.velocity.y;
    this.scale = config.scale;
    this.lifespan = config.lifespan;
    this.display = "block";
    imagesource ? (this.imageSrc = imagesource) : (this.imageSrc = "");

    //add logic to determine where particle starts
    let randomAngle, randomX, randomY;
    switch (this.emitter.shape) {
      case "Point":
        this.xposition = this.emitter.position.x + this.emitter.originOffset.x;
        this.yposition = this.emitter.position.y + this.emitter.originOffset.y;
        break;
      case "Circle":
        switch (this.emitter.emissionBehavior) {
          case "Point":
            this.xposition = this.emitter.position.x + this.emitter.originOffset.x;
            this.yposition = this.emitter.position.y + this.emitter.originOffset.y;
            break;
          case "Area":
            randomAngle = Math.random() * 360;
            const randomMag = Math.random() * this.emitter.radius;
            this.xposition = randomMag * Math.cos(this.ang2rad(randomAngle));
            this.yposition = randomMag * Math.sin(this.ang2rad(randomAngle));
            break;
          case "Edge":
            randomAngle = Math.random() * 360;
            this.xposition = this.emitter.radius * Math.cos(this.ang2rad(randomAngle));
            this.yposition = this.emitter.radius * Math.sin(this.ang2rad(randomAngle));
            break;
        }
        break;
      case "Rect":
        switch (this.emitter.emissionBehavior) {
          case "Point":
            this.xposition = this.emitter.position.x + this.emitter.originOffset.x;
            this.yposition = this.emitter.position.y + this.emitter.originOffset.y;
            break;
          case "Area":
            randomX = Math.random() * this.emitter.size.w;
            randomY = Math.random() * this.emitter.size.h;
            this.xposition = this.emitter.position.x + this.emitter.originOffset.x + randomX;
            this.yposition = this.emitter.position.y + this.emitter.originOffset.y + randomY;
            break;
          case "Edge":
            let randomEdge = Math.floor(Math.random() * 4);
            switch (randomEdge) {
              case 0:
                //Top
                this.yposition = this.emitter.position.y + this.emitter.originOffset.y; //fixed y
                randomX = Math.random() * this.emitter.size.w;
                this.xposition = this.emitter.position.x + this.emitter.originOffset.x + randomX;
                break;
              case 1:
                //Right
                this.xposition = this.emitter.position.x + this.emitter.originOffset.x + this.emitter.size.w; //fixed x
                randomY = Math.random() * this.emitter.size.h;
                this.yposition = this.emitter.position.y + this.emitter.originOffset.y + randomY;
                break;
              case 2:
                //Bottom
                //Top
                this.yposition = this.emitter.position.y + this.emitter.originOffset.y + this.emitter.size.h; //fixed y
                randomX = Math.random() * this.emitter.size.w;
                this.xposition = this.emitter.position.x + this.emitter.originOffset.x + randomX;
                break;
              case 3:
                //Left
                this.xposition = this.emitter.position.x + this.emitter.originOffset.x; //fixed x
                randomY = Math.random() * this.emitter.size.h;
                this.yposition = this.emitter.position.y + this.emitter.originOffset.y + randomY;
                break;
            }
            break;
        }
        break;
    }
  }
  destroy(id: string) {
    this.display = "none";
    this.status = "dead";
    this.emitter.destroyParticle(id);
  }

  update(deltaTime: number) {
    this.xposition += this.velocity.x;
    this.yposition += this.velocity.y;
    this.angle += this.rotationalVelocity;
    this.lifespan -= deltaTime;
    if (this.lifespan <= 0 && this.status != "dead") {
      this.destroy(this.id);
    }
  }

  setVelocity(vel: { x: number; y: number }) {
    this.velocity.x = vel.x;
    this.velocity.y = vel.y;
  }
  getVelocity() {
    return this.velocity;
  }
  setRotation(rot: number) {
    this.rotationalVelocity = rot;
  }
  getRotation() {
    return this.rotationalVelocity;
  }
  getAngle() {
    return this.angle;
  }

  ang2rad(ang: number): number {
    return ang * (Math.PI / 180);
  }
}

// ******************************************************
// the ParticlePool class
// constructor accepts two params, the Particle System reference
// and the quantity of the pool
// this class is responsible for managing a stack of particles
// that get pushed/popped as needed
// if a particle is pulled from, it gets reset by configuration
// prior to being re-rendered
// ******************************************************
export class ParticlePool {
  parent: ParticleSystem;
  pool: Array<Particle> = [];
  poolsize: number;
  poolIndex: number;

  constructor(parent: ParticleSystem, poolsize: number) {
    this.parent = parent;
    this.poolsize = poolsize;
    this.poolIndex = 0;
  }

  getParticleFromPool(config: ParticleConfig): Particle | void {
    let newPart = this.pool.pop();

    if (newPart) {
      newPart.lifespan = config.lifespan;
      newPart.velocity.x = config.velocity.x;
      newPart.velocity.y = config.velocity.y;
      newPart.xposition = newPart.emitter.position.x + newPart.emitter.originOffset.x;
      newPart.yposition = newPart.emitter.position.y + newPart.emitter.originOffset.y;
      newPart.status = "alive";
      newPart.display = "block";
      return newPart;
    }
  }

  moveToPool(index: number) {
    if (this.pool.length < this.poolsize) this.pool.push(this.parent.particles[index]);
    else {
      //pool's full, destroy particle
      this.parent.particles.slice(index, 1);
    }
  }
}
