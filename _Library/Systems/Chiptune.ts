/*
  This class is generated as an abstraction of the Autotracker project.
  https://www.vitling.xyz/toys/autotracker/

  This is my attribution to that project, and a link to the license of it below.
  Modifications to the source include refactoring tracker.ts into an import-able class for Squeleto Game Framework

  Copyright 2020 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

import Audio from "./chiptune/audio.js";
import * as music from "./chiptune/theory.js";
import * as Generators from "./chiptune/generators.js";
import { scales } from "./chiptune/theory.js";
import { choose, fill, rndInt, rnd, seedRNG } from "./chiptune/utils.js";
import * as ChipTuneTypes from "./chiptune/model.js";

interface State {
  key: ChipTuneTypes.Key;
  scale: ChipTuneTypes.Scale;
  progression: ChipTuneTypes.Progression;
  bpm: number;
  songIndex: number;
  seedCode: string;
}

const PatternSize = 64;

const progressions = [
  [1, 1, 1, 1, 6, 6, 6, 6, 4, 4, 4, 4, 3, 3, 5, 5],
  [1, 1, 1, 1, 6, 6, 6, 6, 1, 1, 1, 1, 6, 6, 6, 6],
  [4, 4, 4, 4, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 3, 3],
  [1, 1, 6, 6, 4, 4, 5, 5, 1, 1, 6, 6, 3, 3, 5, 5],
  [5, 5, 4, 4, 1, 1, 1, 1, 5, 5, 6, 6, 1, 1, 1, 1],
  [6, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 5, 5, 5, 5],
  [1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
  [6, 6, 6, 6, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 5, 5],
  [1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4],
];

type Synth<T> = { play: (note: T) => void };
type FourChannelsPlusDrums = [ChipTuneTypes.Note, ChipTuneTypes.Note, ChipTuneTypes.Note, ChipTuneTypes.Note, ChipTuneTypes.Drum];
type PatternsType<T> = { [K in keyof T]: ChipTuneTypes.Pattern<T[K]> };
type SynthsType<T> = { [K in keyof T]: Synth<T[K]> };
type SaveCode = string & { typeTag: "__SaveCode" };

export class Chiptune {
  mySeed: string;
  state: State;
  ctx: AudioContext;
  au: any;
  clock;
  synths: SynthsType<FourChannelsPlusDrums>;
  patterns: PatternsType<FourChannelsPlusDrums> = [[], [], [], [], []];

  constructor(seed: string) {
    this.mySeed = seed;
    seedRNG(this.mySeed);
    this.state = this.createInitialState(this.mySeed);
    this.patterns = [[], [], [], [], []] as PatternsType<FourChannelsPlusDrums>;
    this.clock = this.bpmClock();
    // @ts-ignore
    this.ctx = new (window.AudioContext || window.webkitAudioContext)() as AudioContext;
    this.au = Audio(this.ctx);
    this.synths = [
      this.au.SquareSynth(),
      this.au.SquareSynth(-0.5),
      this.au.SquareSynth(),
      this.au.SquareSynth(0.5),
      this.au.DrumSynth(),
    ];

    // create initial patterns
    this.newPatterns();
    this.clock.set(this.state.bpm, this.frame);
  }

  createInitialState(seedOrSave: string): State {
    if (seedOrSave.startsWith("0x")) {
      return this.restore(seedOrSave as SaveCode);
    } else {
      seedRNG(seedOrSave && seedOrSave.length > 0 ? seedOrSave : "" + Math.random());
      return {
        key: rndInt(12) as ChipTuneTypes.Key,
        scale: music.scales.minor,
        progression: progressions[0],
        bpm: 112,
        seedCode: this.createSeedCode(),
        songIndex: 0,
      };
    }
  }

  createSeedCode() {
    return this.hex(rndInt(255)) + this.hex(rndInt(255)) + this.hex(rndInt(255)) + this.hex(rndInt(255));
  }

  hex(v: number) {
    return Math.floor(v).toString(16).toUpperCase().padStart(2, "0");
  }
  unhex(v: string): number {
    return parseInt(v, 16);
  }
  restore(code: SaveCode): State {
    const codeString = code.slice(2);
    const key = this.unhex(codeString.slice(0, 2)) as ChipTuneTypes.Key;
    const scale = this.unhex(codeString.slice(2, 4)) === 0 ? music.scales.major : music.scales.minor;
    const progression = progressions[this.unhex(codeString.slice(4, 6))];
    const bpm = this.unhex(codeString.slice(6, 8));
    const songIndex = this.unhex(codeString.slice(8, 10));
    const seedCode = codeString.slice(10);
    return {
      bpm,
      key,
      progression,
      scale,
      seedCode,
      songIndex,
    };
  }
  bpmClock() {
    let intervalHandle = {
      bpmClock: 0,
    };
    let fN = 0;
    function set(bpm: number, frameFunction: (f: number) => void) {
      window.clearInterval(intervalHandle.bpmClock);
      intervalHandle.bpmClock = window.setInterval(() => frameFunction(fN++), 60000 / bpm / 4);
    }
    return {
      set,
    };
  }

  newPatterns() {
    seedRNG(this.state.seedCode);
    this.patterns = [
      choose([Generators.bass, Generators.bass2, Generators.emptyNote])(this.state),
      rnd() < 0.7 ? Generators.arp(this.state) : Generators.emptyNote(),
      rnd() < 0.7 ? Generators.melody1(this.state) : Generators.emptyNote(),
      choose([Generators.emptyNote, Generators.arp, Generators.melody1])(this.state),
      rnd() < 0.8 ? Generators.drum() : Generators.emptyDrum(),
    ];
  }

  attenuate = (value: number) => {
    let gain;
    if (value >= 0.1) gain = 0.1;
    else if (value < 0) gain = 0;
    else gain = value;

    this.au.setGain(gain);
  };

  frame = (f: number) => {
    const positionInPattern = f % PatternSize;
    if (f % 128 === 0 && f !== 0) {
      this.mutateState();
      this.newPatterns();
      this.clock.set(this.state.bpm, this.frame);
      //display.setPatterns(patterns, save(state));
    }

    //display.highlightRow(positionInPattern);

    // Not a loop because these tuple parts have different types depending on melody vs drum
    this.synths[0].play(this.patterns[0][positionInPattern]);
    this.synths[1].play(this.patterns[1][positionInPattern]);
    this.synths[2].play(this.patterns[2][positionInPattern]);
    this.synths[3].play(this.patterns[3][positionInPattern]);
    this.synths[4].play(this.patterns[4][positionInPattern]);
  };

  mutateState = () => {
    this.state.songIndex++;
    if (this.state.songIndex % 8 === 0) {
      this.state.bpm = Math.floor(rnd() * 80) + 100;
      //clock.set(state.bpm, frame);
    }
    if (this.state.songIndex % 4 === 0) {
      [this.state.key, this.state.scale] = music.modulate(this.state.key, this.state.scale);
    }
    if (this.state.songIndex % 2 === 0) {
      this.state.progression = choose(progressions);
    }
    this.state.seedCode = this.hex(rndInt(255)) + this.hex(rndInt(255)) + this.hex(rndInt(255)) + this.hex(rndInt(255));
    seedRNG(this.state.seedCode);

    //display.setPatterns(patterns, stateString);
  };
}
