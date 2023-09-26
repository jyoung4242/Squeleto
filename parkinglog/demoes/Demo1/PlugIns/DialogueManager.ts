/***********************************************************
 * Custom Module: Dialog System
 * Allows you to custom create UI based systems
 * for controlling displayed dialog, and also tracking
 * progression via storyflags
 *
 * this demonstrates how a the 'template' parameter can be used
 * in conjunction with the game scene and can be controlled
 * outside of the renderer
 *
 * in the template, custom style tag is used for customization
 ************************************************************/
import { UI } from "@peasy-lib/peasy-ui";
import { GameObject } from "../../parkinglog/GameObject";
import { Signal } from "../../_Squeleto/Signals";
import { collisionBody } from "../../parkinglog/MapManager";
import { Game } from "../Scenes/game";

//**************************************** */
// type for defining choices in the dialog
//**************************************** */
export type DialogChoices = {
  message: string;
  flags: DialogConditions;
  speed?: number;
};

//**************************************** */
// type for defining your dialog content
//**************************************** */
export type DialogContent = {
  type: string;
  speed?: number;
  message?: string;
  avatar: Array<string>;
  end?: boolean;
  flags?: DialogConditions;
  options?: Array<DialogChoices>;
};

//*********************************************** */
// type for defining your story flag requirements
//*********************************************** */
export type DialogConditions = { [key: string]: boolean } | "default";

//******************************************************* */
// type for defining in your conversation classes different
// parts of the conversation, and then feeding them into the
// dialog manager
//******************************************************** */
export type DialogSnapshot = {
  conditions: DialogConditions;
  content: Array<DialogContent>;
};

export class DialogManager {
  template = `
  <style>
  
  dialog-container{
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      opacity: 1;
      transition: opacity 0.2s;
  }
  dialog-container.pui-adding,
  dialog-container.pui-removing{
      opacity: 0;
  }

  dialog-inner{
      padding: 0px;
      position: absolute;
      background-color: AntiqueWhite;
      color: Navy;
      inset: 75% 0 0 0;
      height: var(--dialogue-ht, 25%);
      display: grid;
      grid-template-rows: auto;
      grid-template-columns: repeat(14, 1fr);
      gap: 2px;
      grid-template-areas: \${dm.gridTemplate};
      align-itmes: center;
      justify-items: stretch;
      user-select: none;
      opacity:1;
      transition: opacity 0.2s;
  }
  dialog-inner.pui-adding,
  dialog-inner.pui-removing{
      opacity:0;
  }


  avatar-portrait{
      grid-area: portrait;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
  }
  
  avatar-portrait2{
      grid-area: portrait2;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
  }

  dialog-content{
      grid-area: content;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
  }

  dialog-choice1{
      grid-area: choice1;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
  }
  dialog-choice2{
      grid-area: choice2;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
  }
  dialog-choice3{
      grid-area: choice3;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
  }

  dialog-choice1:hover,
  dialog-choice2:hover,
  dialog-choice3:hover{
      background-color:purple;
      color:AntiqueWhite;
  }


  dialog-submit{
      grid-area: submit;
      border: 1px solid purple;
      border-radius: 3px;
      font-size: xx-small;
      cursor: pointer;
      display: flex; 
      flex-direction:column; 
      justify-content: center;
      align-items: center;
      user-select: none;
  }


</style>

  <dialog-container \${===dm.isDialogActive} >
      <dialog-inner \${!==dm.isTransitionActive}>
          <avatar-portrait \${===dm.isLeftVisible} style="background-image: url(\${dm.portraitLeft}); background-size: cover;"></avatar-portrait>
          <avatar-portrait2 \${===dm.isRightVisible} style="background-image: url(\${dm.portraitRight}); background-size: cover;" ></avatar-portrait2>
          <dialog-content \${===dm.isContentVisible}>\${dm.dialogContent}</dialog-content>
          <dialog-choice1 data-index="0" \${===dm.isChoice1Enabled} \${click@=>dm.selectOption}>\${dm.choice1Content}</dialog-choice1>
          <dialog-choice2 data-index="1" \${===dm.isChoice2Enabled} \${click@=>dm.selectOption}>\${dm.choice2Content}</dialog-choice2>
          <dialog-choice3 data-index="2" \${===dm.isChoice3Enabled} \${click@=>dm.selectOption}>\${dm.choice3Content}</dialog-choice3>
          <dialog-submit \${click@=>dm.runNext} \${===dm.isSubmitEnabled}><div>\${dm.submitText}</div></dialog-submit>
      </dialog-inner>
  </dialog-container>

`;

  who: GameObject | string;
  dlgIndex = 0;
  isConfigured = false;
  activeNarrative: Conversation | undefined;
  dialogType: "left" | "right" | "none" | "both" | "right_interact" | "left_interact" = "left";

  //dialog Signal
  dialogSignal: Signal;

  //storyflag state
  storyFlagstoClear: any;
  storyFlags: any = undefined;

  //typewriter UI state
  dlgIntervalHandler: number = 0;
  letterIndex = 0;

  //UI content
  dialogPendingContent = "";
  dialogContent = "";
  submitText = "NEXT";
  portraitLeft: string = "";
  portraitRight: string = "";
  choice1Content = "";
  choice2Content = "";
  choice3Content = "";

  //UI flags
  isLeftVisible = true;
  isRightVisible = false;
  isContentVisible = true;
  isChoice1Enabled = false;
  isChoice2Enabled = false;
  isChoice3Enabled = false;
  isTransitionActive = false;
  isSubmitEnabled = true;
  isDialogActive = false;

  constructor() {
    this.who = "";
    this.dialogSignal = new Signal("");
  }

  //********************************** */
  //Loading conversation data
  //********************************** */
  configureNarrative(narration: Conversation) {
    this.activeNarrative = narration;
    if (typeof narration.who == "string" || typeof narration.who == "object") this.who = narration.who;
    console.log("in dialogman, ", this.who);

    if (this.who) this.dialogSignal = new Signal("dialogueComplete", this.who);
    this.isConfigured = true;
    this.portraitRight;
  }

  //********************************** */
  //starts the UI sequence of conversation
  //********************************** */
  runNarrative() {
    if (!this.isConfigured) return;
    this.clearDmInterval();
    this.dlgIndex = 0;
    this.setupUI();
  }

  //********************************** */
  //provides reference to Scene's storyflags
  //WILL mutate them
  //********************************** */
  configureStoryFlags = (sf: any) => {
    this.storyFlags = sf;
  };

  //********************************** */
  //main routine for manipulating DOM
  //********************************** */
  setupUI() {
    const content = this.getContent();
    if (content != undefined) {
      this.clearDmInterval();
      this.letterIndex = 0;
      if (content[this.dlgIndex].end) {
        this.submitText = "END";
        this.storyFlagstoClear = content[this.dlgIndex].flags;
      } else this.submitText = "NEXT";

      if (content[this.dlgIndex].type == "left" || content[this.dlgIndex].type == "left_interact") {
        this.portraitLeft = content[this.dlgIndex].avatar[0];
        this.dialogType = "left";
      } else if (content[this.dlgIndex].type == "right" || content[this.dlgIndex].type == "right_interact") {
        this.portraitRight = content[this.dlgIndex].avatar[0];
        if (content[this.dlgIndex].type == "right") {
          this.dialogType = "right";
          this.isContentVisible = true;
        } else {
          this.dialogType = "right_interact";
          this.isContentVisible = false;
          this.isSubmitEnabled = false;
          this.isChoice1Enabled = true;
          this.isChoice2Enabled = true;
          this.isChoice3Enabled = true;
        }
      } else if (content[this.dlgIndex].type == "both") {
        this.portraitLeft = content[this.dlgIndex].avatar[0];
        this.portraitRight = content[this.dlgIndex].avatar[1];
        this.dialogType = "both";
      } else {
        this.dialogType = "none";
      }

      if (content[this.dlgIndex].message != undefined) {
        this.dialogPendingContent = <string>content[this.dlgIndex].message;
      } else if (content[this.dlgIndex].options != undefined) {
        this.isChoice1Enabled = true;
        this.isChoice2Enabled = true;
        this.choice1Content = content[this.dlgIndex].options![0].message;
        this.choice2Content = content[this.dlgIndex].options![1].message;
        if (content[this.dlgIndex].options![2] != undefined) {
          this.isChoice3Enabled = true;
          this.choice3Content = content[this.dlgIndex].options![2].message;
        }
      }

      if (content[this.dlgIndex].speed != undefined) {
        content[this.dlgIndex].speed = content[this.dlgIndex].speed;
      }

      this.dlgIntervalHandler = setInterval(() => {
        if (this.letterIndex == this.dialogPendingContent.length) {
          this.clearDmInterval();
          return;
        }
        this.dialogContent = this.dialogPendingContent.substring(0, this.letterIndex);
        this.letterIndex++;
      }, <number>content[this.dlgIndex].speed);
    }

    //qeueu visibility
    UI.queue(() => {
      this.isTransitionActive = false;
      this.isDialogActive = true;
    });
  }

  //******************************************* */
  //the bound event to the next/end submit button
  //******************************************* */
  runNext = () => {
    this.isTransitionActive = true;

    UI.queue(() => {
      if (this.submitText == "NEXT") {
        //index conversation
        //hide screen
        this.dialogContent = "";
        this.dialogPendingContent = "";
        this.dlgIndex++;
        this.setupUI();
      } else {
        //end of conversation
        //setstoryflags for conversation
        const content = this.getContent();
        if (content) {
          const flags = this.storyFlagstoClear;
          if (flags) {
            Object.keys(flags as DialogConditions).forEach(flag => {
              //@ts-ignore
              this.storyFlags[flag] = flags[flag];
            });
          }
        }
        this.isConfigured = false;
        this.isDialogActive = false;

        console.log("sending signal", this.dialogSignal);

        this.dialogSignal.send([this.who]);
      }
    });
  };

  //******************************************* */
  // based on index of dialog, grabs the content
  // returns the content info based on matching
  // conditions
  //******************************************* */
  getContent = () => {
    //loop through keys and find first match
    if (this.activeNarrative) {
      for (const [key, entry] of Object.entries(this.activeNarrative.messageSnapshots)) {
        const conditions = Object.entries(entry.conditions);
        if (entry.conditions == "default") return entry.content; //what is index of that narrative
        if (conditions.length) {
          let test_cntr = 0;
          conditions.forEach((cond: any) => {
            if (this.storyFlags[cond[0]] == cond[1]) {
              test_cntr++;
            }
          });
          if (test_cntr == conditions.length) return entry.content; //what is index of that narrative
        } else {
          return entry.content; //what is index of that narrative
        }
      }
    }
  };

  //******************************************* */
  // based on index passed, displays the
  // selection response onto the content UI field
  //******************************************* */
  displaySelection = async (index: number) => {
    const content = this.getContent();
    if (content) {
      this.storyFlagstoClear = content[this.dlgIndex].options![index].flags;
      this.isTransitionActive = true;
      await this.wait(100);
      UI.queue(async () => {
        this.dialogPendingContent = content[this.dlgIndex].options![index].message;
        if (this.dialogType == "right_interact") this.dialogType = "right";
        else this.dialogType = "left";
        this.isChoice1Enabled = false;
        this.isChoice2Enabled = false;
        this.isChoice3Enabled = false;
        this.isContentVisible = true;
        this.isSubmitEnabled = true;
        this.letterIndex = 0;

        if (content[this.dlgIndex].options![0].speed) content[this.dlgIndex].speed = content[this.dlgIndex].options![index].speed;

        if (content[this.dlgIndex].speed != undefined)
          this.dlgIntervalHandler = setInterval(() => {
            if (this.letterIndex == this.dialogPendingContent.length) {
              this.clearDmInterval();
              return;
            }
            this.dialogContent = this.dialogPendingContent.substring(0, this.letterIndex);
            this.letterIndex++;
          }, <number>content[this.dlgIndex].speed);
        this.isTransitionActive = false;
      });
    }
  };

  //******************************************* */
  // event ran on option selection
  //******************************************* */

  selectOption = async (_event: any, model: any, element: HTMLElement) => {
    let optionIndex: number = 0;
    /*    depending on which choice selected, returns different data attribute    */
    if (element.getAttribute("data-index") == "0") optionIndex = 0;
    else if (element.getAttribute("data-index") == "1") optionIndex = 1;
    else if (element.getAttribute("data-index") == "1") optionIndex = 2;
    else optionIndex = 0;
    this.displaySelection(optionIndex);
  };

  get gridTemplate() {
    switch (this.dialogType) {
      case "left":
        this.isLeftVisible = true;
        this.isRightVisible = false;
        return `\". . . . . . . . . . . . . .  \"
            \"portrait portrait content content content content content content content content content content content .\"
            \"portrait portrait content content content content content content content content content content content .\"
            \"portrait portrait content content content content content content content content content content content .\"
            \"portrait portrait content content content content content content content content content content content .\"
            \"portrait portrait content content content content content content content content content content content .\"
            \"portrait portrait content content content content content content content content content content content .\"
            \"portrait portrait content content content content content content content content content content content submit\"
            \"portrait portrait content content content content content content content content content content content submit\"
            \". . . . . . . . . . . . . .  \"`;
      case "both":
        this.isLeftVisible = true;
        this.isRightVisible = true;
        return `\". . . . . . . . . . . . . .  \"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 .\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 .\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 .\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 .\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 .\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 .\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 submit\"
        \"portrait portrait content content content content content content content content content portrait2 portrait2 submit\"
        \". . . . . . . . . . . . . .  \"`;
      case "none":
        this.isLeftVisible = false;
        this.isRightVisible = false;
        return `\". . . . . . . . . . . . . .  \"
        \"content content content content content content content content content content content content content .\"
        \"content content content content content content content content content content content content content .\"
        \"content content content content content content content content content content content content content .\"
        \"content content content content content content content content content content content content content .\"
        \"content content content content content content content content content content content content content .\"
        \"content content content content content content content content content content content content content .\"
        \"content content content content content content content content content content content content content submit\"
        \"content content content content content content content content content content content content content submit\"
        \". . . . . . . . . . . . . .  \"`;
      case "right":
        this.isLeftVisible = false;
        this.isRightVisible = true;
        return `\". . . . . . . . . . . . . .  \"
        \"content content content content content content content content content content content portrait2 portrait2 .\"
        \"content content content content content content content content content content content portrait2 portrait2 .\"
        \"content content content content content content content content content content content portrait2 portrait2 .\"
        \"content content content content content content content content content content content portrait2 portrait2 .\"
        \"content content content content content content content content content content content portrait2 portrait2 .\"
        \"content content content content content content content content content content content portrait2 portrait2 .\"
        \"content content content content content content content content content content content portrait2 portrait2 submit\"
        \"content content content content content content content content content content content portrait2 portrait2 submit\"
        \". . . . . . . . . . . . . .  \"`;
      case "left_interact":
        this.isLeftVisible = true;
        this.isRightVisible = false;
        return `\". . . . . . . . . . . . . .  \"
            \"portrait portrait choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 .\"
            \"portrait portrait choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 .\"
            \"portrait portrait choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 .\"
            \"portrait portrait choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 .\"
            \"portrait portrait choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 .\"
            \"portrait portrait choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 .\"
            \"portrait portrait choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 submit\"
            \"portrait portrait choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 submit\"
            \". . choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 .  \"`;
      case "right_interact":
        this.isLeftVisible = false;
        this.isRightVisible = true;
        return `\". . . . . . . . . . . . . .  \"
        \"choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 portrait2 portrait2 .\"
        \"choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 portrait2 portrait2 .\"
        \"choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 choice1 portrait2 portrait2 .\"
        \"choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 portrait2 portrait2 .\"
        \"choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 portrait2 portrait2 .\"
        \"choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 choice2 portrait2 portrait2 .\"
        \"choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 portrait2 portrait2 . \"
        \"choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 portrait2 portrait2 .\"
        \"choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 choice3 . . .  \"`;
    }
  }

  clearDmInterval() {
    if (this.dlgIntervalHandler != 0) clearInterval(this.dlgIntervalHandler);
    this.dlgIntervalHandler = 0;
  }

  speedup() {
    if (this.letterIndex == this.dialogPendingContent.length) {
      this.runNext();
    } else {
      clearInterval(this.dlgIntervalHandler);
      this.dlgIntervalHandler = 0;
      this.dlgIntervalHandler = setInterval(() => {
        if (this.letterIndex >= this.dialogPendingContent.length + 1) {
          this.clearDmInterval();

          this.letterIndex = this.dialogPendingContent.length;
          return;
        }
        this.dialogContent = this.dialogPendingContent.substring(0, this.letterIndex);
        this.letterIndex++;
      }, 5);
    }
  }

  async wait(howlong: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), howlong);
    });
  }
}

//************************************* */
// content class, one can create different
// conversations and load up the
// messagesnapshots with different snapshots of
// dialog
//************************************* */
export class Conversation {
  backgroundColor: string = "";
  borderColor: string = "";
  messageSnapshots: Array<DialogSnapshot> = [];
  who: GameObject | string | undefined;

  constructor(who?: GameObject | string) {}
}
