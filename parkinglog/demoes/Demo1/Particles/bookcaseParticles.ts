import {
  Particle,
  ParticleEmitter,
  ParticleSystem,
  EmitterConfig,
  ParticleSystemConfig,
  ParticleConfig,
  ParticlePool,
} from "../PlugIns/Particles";

/***********************************************************
 * Content of PlugIn: DOM Based Particle System
 * this is the content application of the custom plug-in
 * this example creates a particle system, and one emitter
 * the emitter has an image bound to it
 * and the emitter simply has an interval tied to it that spits
 * out particles at a determined rate
 * The particles simply move at a random velocity
 * and random lifespan
 * and have a bubble image attached to them, as well as a string
 * of custom CSS, which is the secret power of this library
 ************************************************************/

export class bookCaseParticleSystem extends ParticleSystem {
  assets: any;
  constructor(assets: any) {
    const config: ParticleSystemConfig = {
      containtype: "visible",
      width: 32,
      height: 26,
      xposition: 0,
      yposition: 0,
      poolSize: 300,
    };
    super(config);
    this.assets = assets;
  }

  startEvent() {
    if (this.emitters.length == 0) this.createEmitter();
  }

  createEmitter(): void {
    const newEmitter = new bookCaseEmitter(this, this.assets.image("spark").src);
    this.emitters.push(newEmitter);
  }
}

export class bookCaseEmitter extends ParticleEmitter {
  sparkImage: string;
  latched = false;

  constructor(parent: ParticleSystem, particleimagesource: string, emitterImageSource?: string) {
    const config: EmitterConfig | ParticleEmitter = {
      originOffset: { x: 0, y: 0 }, //from emitter center
      width: 32,
      height: 26,
      xposition: 0,
      yposition: 0,
      angle: 0,
      isVisible: true,
      shape: "Rect",
      emissionRegion: "Edge",
    };

    super(parent, config);
    this.sparkImage = particleimagesource;

    for (let index = 0; index < 175; index++) {
      const newPart = bookCaseParticles.config;
      let part = this.createParticle(newPart, this.sparkImage);
      let currentPositionX = part.xposition;
      let currentPositionY = part.yposition;
      let particleVector = { x: currentPositionX - this.centerpoint.x, y: currentPositionY - this.centerpoint.y };
      let particleTheta = Math.atan2(particleVector.y, particleVector.x);
      let velocityX = (0.5 + Math.random() * 0.5) * Math.cos(particleTheta);
      let velocityY = (0.5 + Math.random() * 0.5) * Math.sin(particleTheta);
      part.setVelocity({ x: velocityX, y: velocityY });
    }

    setTimeout(() => {
      this.parentSystem.particles = [];
      this.parentSystem.pool.pool = [];
      this.parentSystem.destroyEmitter(this.id);
    }, 1500);
  }
}

export class bookCaseParticles extends Particle {
  static config: ParticleConfig = {
    width: 4,
    height: 4,
    angle: 0,
    lifespan: 1500,
    velocity: { x: 0, y: 0 },
    scale: 1,
    isVisible: true,
    customCSS: "",
  };
}

export class bookCasePool extends ParticlePool {
  getParticleFromPool(config: ParticleConfig): Particle | void {
    let newPart = this.pool.pop();

    if (newPart) {
      newPart.lifespan = config.lifespan;
      let currentPositionX = newPart.xposition;
      let currentPositionY = newPart.yposition;
      let particleVector = {
        x: newPart.emitter.centerpoint.x - currentPositionX,
        y: -newPart.emitter.centerpoint.y - currentPositionY,
      };
      let particleTheta = Math.atan2(particleVector.y, particleVector.x);
      let velocityX = Math.random() * 2 * Math.cos(particleTheta);
      let velocityY = Math.random() * 2 * Math.sin(particleTheta);
      newPart.setVelocity({ x: velocityX, y: velocityY });
      newPart.status = "alive";
      newPart.display = "block";
      return newPart;
    }
  }
}
