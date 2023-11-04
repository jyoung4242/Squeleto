// game.test.ts
import { describe, test, expect, beforeEach, it, assert, vi, afterEach } from "vitest";
import { SceneManager } from "../../_Squeleto/Scene";
import { Login } from "../Scenes/login";
import { Game } from "../Scenes/game";
import { JSDOM } from "jsdom";
import { Viewport } from "@peasy-lib/peasy-viewport";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../types";
import { Assets } from "@peasy-lib/peasy-assets";

export async function waitFor<T>(fn: () => T | Promise<T>, timeout: number = 5000): Promise<T> {
  const start = Date.now();

  while (true) {
    try {
      const result = await fn();

      return result;
    } catch (e) {
      // retry every 100ms
      await new Promise(resolve => setTimeout(resolve, 100));

      // if timeout has elapsed, throw the error, otherwise suppress it and retry
      if (Date.now() - start > timeout) {
        throw e;
      }
    }
  }
}

describe("Game", () => {
  beforeEach(() => {});

  let login: any;
  let game: any;
  let sceneMgr: any;

  let { window } = new JSDOM();
  let document = window.document;

  SceneManager.viewport = Viewport.create({ size: { x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT } });
  sceneMgr = new SceneManager();
  let scenes = sceneMgr.register(Login, Game);

  test("are assets loaded", async () => {
    vi.useFakeTimers();
    sceneMgr.set("Game");
    vi.advanceTimersByTime(5000);
    let allScenes = sceneMgr.get();
    let gameScene = allScenes.state;

    const heroImage = Assets.image("hero");
    expect(heroImage.src).toBeDefined();
    vi.useRealTimers();
  }, 10000);
});

/*

  test("are viewport layers loaded", () => {
    setTimeout(() => {
      const allLayers = SceneManager.viewport.layers;
      expect(allLayers.length).toBe(4);
    }, 1000);
  });

  test("are entities layers loaded", () => {
    setTimeout(() => {
      const entities = document.getElementsByTagName("entity-layer");
      expect(entities.length).toBeGreaterThan(0);
    }, 1000);
  });

  test("are entity and systems loaded", () => {
    setTimeout(() => {
      expect(game.entities.length).toBeGreaterThan(0);
      expect(game.Systems.length).toBeGreaterThan(0);
    }, 1000);
  });

  test("is Engine running", () => {
    setTimeout(() => {
      expect(game.update).toBeCalled();
      expect(Audio.update).toBeCalled();
    }, 1000);
  });

  test("engine pause", () => {
    setTimeout(() => {
      let gameScene = sceneMgr.get();

      let testSignal = new Signal("pauseEngine");
      testSignal.send();

      expect(gameScene.engine.pause).toBeCalled();
    }, 1000);
  });

*/
