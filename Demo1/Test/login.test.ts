// login.test.ts
import { describe, test, expect, beforeEach, it, assert } from "vitest";
import { SceneManager } from "../../_Squeleto/Scene";
import { Login } from "../Scenes/login";
import { Game } from "../Scenes/game";
import { JSDOM } from "jsdom";
import { Viewport } from "@peasy-lib/peasy-viewport";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../types";

describe("Login", () => {
  let login: any;
  let game: any;
  let { window } = new JSDOM();
  let document = window.document;
  let sceneMgr: any;

  beforeEach(() => {
    SceneManager.viewport = Viewport.create({ size: { x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT } });
    sceneMgr = new SceneManager();
    login = Login;
    game = Game;
    sceneMgr.register(login, game);
    sceneMgr.set("Login");
  });

  test("isLogin", () => {
    expect(login.name).toBe("Login");
  });

  test("is there body element", () => {
    assert.ok(document.body);
  });

  test("is the scene layer rendered", () => {
    let sceneLayer = document.getElementsByClassName("scene");
    assert.ok(sceneLayer);
  });

  test("is anchor tag rendered", () => {
    let myAnchor = document.getElementsByTagName("a");
    for (let anchor of myAnchor) {
      assert.ok(anchor.innerText == "Start Demo");
    }
  });

  test("viewport layer added", () => {
    const allLayers = SceneManager.viewport.layers;
    expect(allLayers.length).toBeGreaterThan(0);
  });

  test("click Start Demo", () => {
    let myAnchor = document.getElementsByTagName("a");
    for (let anchor of myAnchor) {
      expect(sceneMgr.current).toBe("Login");
      anchor.click();
      expect(sceneMgr.current).toBe("Game");
      expect(login.start).toBeCalled();
      expect(login.exit).toBeCalled();
    }
  });

  test("layers removed on click", () => {
    let myAnchor = document.getElementsByTagName("a");
    for (let anchor of myAnchor) {
      let allLayers = SceneManager.viewport.layers;
      //find login layer
      let layerIndex = allLayers.findIndex(lyr => lyr.name == "login");
      expect(layerIndex).toBeGreaterThan(-1);
      anchor.click();
      allLayers = SceneManager.viewport.layers;
      layerIndex = allLayers.findIndex(lyr => lyr.name == "login");
      expect(layerIndex).toBe(-1);
    }
  });
});
