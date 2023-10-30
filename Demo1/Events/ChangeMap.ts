/*****************************************************************************
 * Event: ChangeMap
 * Components Required: PositionComponent,VelocityComponent,ColliderComponent,
 * KeyboardComponent, NameComponent,  RenderComponent, MapComponent
 *
 * Signals: mapchange
 *
 * Parameters:
 * [0]- <string> - this.mapname - string name of map to switch to
 * [1]- <Vector> - this.position - where to move the hero entity
 *
 * Description:
 * based on the parameters passed on the creation of Event, allows the viewport
 * layers to be modified (size and images), also moves the hero's position,
 * sends signal to collision system to update the collision array with new
 * map data... all behind a transition layer in the viewport to hide all theh updates
 * signal also tells the rendering system what new map is
 ******************************************************************************/

import { Layer } from "@peasy-lib/peasy-viewport";
import { SceneManager } from "../../_Squeleto/Scene";
import { Vector } from "../../_Squeleto/Vector";
import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../Systems/Events";
import { Assets } from "@peasy-lib/peasy-assets";
import { Signal } from "../../_Squeleto/Signals";

//components
import { PositionComponent } from "../Components/positionComponent";
import { VelocityComponent } from "../Components/velocity";
import { ColliderComponent } from "../Components/collider";
import { KeyboardComponent } from "../Components/keyboard";
import { NameComponent } from "../Components/name";
import { RenderComponent } from "../Components/render";
import { MapComponent } from "../Components/entitymap";

//maps
import { Kitchen } from "../Maps/kitchen";
import { OutsideMap } from "../Maps/outside";

type MovementEntity = Entity &
  PositionComponent &
  VelocityComponent &
  ColliderComponent &
  KeyboardComponent &
  NameComponent &
  RenderComponent &
  MapComponent;

export class ChangeMap extends GameEvent {
  mapname: string = "";
  position: Vector = new Vector(0, 0);
  layers: Layer[] | undefined;
  mapdata: any[] = [];
  mapChangeSignal: Signal = new Signal("mapchange");

  constructor(who: Entity | string | null, params: [...any]) {
    super(who, params);
    this.event = "ChangeMap";
    this.mapname = params[0];
    this.position = params[1];
  }

  static create(who: Entity | string | null, params: [...any]): ChangeMap {
    return new ChangeMap(who, params);
  }
  // Function to animate fading in
  private fadeIn(element: HTMLElement, duration: number) {
    return element?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: duration,
      easing: "ease-in-out",
      fill: "forwards",
    }).finished;
  }

  // Function to animate fading in
  private fadeOut(element: HTMLElement, duration: number) {
    return element?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: duration,
      easing: "ease-in-out",
      fill: "forwards",
    }).finished;
  }

  init(entities: Entity[]): Promise<void> {
    this.eventStatus = "running";

    this.layers = SceneManager.viewport.layers;
    this.mapdata = [Kitchen, OutsideMap];

    return new Promise(async resolve => {
      //replace images in viewport layers
      let layers = SceneManager.viewport.layers;
      let upper = layers.find(lyr => lyr.name == "mapupper");
      let lower = layers.find(lyr => lyr.name == "maplower");
      let dialog = layers.find(lyr => lyr.name == "dialog");

      //show the transition cover
      const fade = SceneManager.viewport.addLayers({ name: "transition", before: dialog } as any)[0];
      await this.fadeIn(fade.element as HTMLElement, 300);

      //move hero
      let hero = (entities as MovementEntity[]).find(ent => ent.name == "hero");
      if (hero) {
        hero.position.x = this.position.x;
        hero.position.y = this.position.y;
        hero.map = this.mapname;
        hero.collider.map = this.mapname;
      }

      //find map data
      let newmap = this.mapdata.find(mp => mp.name == this.mapname);
      let newwidth = newmap.width;
      let newheight = newmap.height;

      if (upper && lower && upper.element && lower.element && newmap) {
        (upper.element.children[0] as HTMLImageElement).style.backgroundImage = `url(${Assets.image(newmap.upper).src})`;
        (upper.element.children[0] as HTMLImageElement).style.width = `${newwidth}px`;
        (upper.element.children[0] as HTMLImageElement).style.height = `${newheight}px`;
        (lower.element.children[0] as HTMLImageElement).style.backgroundImage = `url(${Assets.image(newmap.lower).src})`;
        (lower.element.children[0] as HTMLImageElement).style.width = `${newwidth}px`;
        (lower.element.children[0] as HTMLImageElement).style.height = `${newheight}px`;
      }
      SceneManager.viewport.update();
      //send signal to collision system for walls and triggers
      this.mapChangeSignal.send([this.mapname, this.position]);
      this.eventStatus = "complete";
      await this.fadeOut(fade.element as HTMLElement, 300);
      SceneManager.viewport.removeLayers(fade);
      resolve();
    });
  }
}
