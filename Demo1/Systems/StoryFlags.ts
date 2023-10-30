/*****************************************************************************
 * System: StoryFlags
 * Components Required: n/a
 * Signals: n/a
 *
 * Description:
 * this system which is global across all scenes (owned by main.ts) tracks
 * a global object of data that can be set/read to change the behavior of entities
 * and help drive the story forward
 *******************************************************************************/

export class StoryFlagSystem {
  static storyflags: Record<string, any> = {};

  static init(): any {
    return this.storyflags;
  }

  static getStoryFlags(): any {
    return this.storyflags;
  }

  static setStoryFlagValue(label: string, value: any) {
    this.storyflags[label] = value;
  }

  static readStoryFlagValue(label: string): any {
    return this.storyflags[label];
  }
}
