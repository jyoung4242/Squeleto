/*****************************************************************************
 * System: Dialog
 * Components Required: none, non-ECS system
 * Signals: confirmSignal, dialogSignal, cutsceneSignal, endSignal
 *
 * Description:
 * this system is owned at the viewport level, which is where the template UI resides
 * if a gameEvent of DialogEvent is fired, this UI gets rendered
 * there are 'simple' Dialogs, which just shows message and an 'end' button,
 * or you can pass a JSON object into the DialogEvent and you can customize
 * inluding options displayed and selectable that changes storyflags
 ******************************************************************************/

import { Signal } from "../../_Squeleto/Signals";
import { Assets } from "@peasy-lib/peasy-assets";

export class Dialogue {
  public static template = `
   
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
      width: 100%;
      height: 25%;
      bottom:-1px;
      left:0;
      display: grid;
      grid-template-rows: 3px 1fr 1fr 1fr 1fr 1fr 3px;
      grid-template-columns: repeat(14, 1fr);
      gap: 1px;
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
      display: flex;
      justify-content: center;
      align-items: center;
      grid-column-start: 1;
      grid-column-end:  3;
      grid-row-start: 2;
      grid-row-end:  7;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
  }
  
  avatar-portrait2{
        grid-column-start: 12;
        grid-column-end:  14;
        grid-row-start: 2;
        grid-row-end:  7;
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
  }

  dialog-content{
    display: flex;
      grid-column-start: \${contentColStart};
      grid-column-end:  \${contentColEnd};
      grid-row-start: 2;
      grid-row-end:  7; 
      border: 1px solid purple;
      border-radius: 3px;
      user-select: none;
      font-size: 0.5vw;
      padding: 2px;
  }

  dialog-choice1{
    font-size: 0.35vw;
    grid-column-start: \${choiceStart};
    grid-column-end:  \${choiceEnd};
    grid-row-start: 4;
    grid-row-end:  4;
    display: flex;
    justify-content: flex-start;
    align-items: center;
      border: 1px solid transparent;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
      padding: 1px;
  }
  dialog-choice2{
    font-size: 0.35vw;
    grid-column-start: \${choiceStart};
    grid-column-end:  \${choiceEnd};
    grid-row-start: 5;
    grid-row-end:  5;
    display: flex;
    justify-content: flex-start;
    align-items: center;
      border: 1px solid transparent;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
      padding: 1px;
  }
  dialog-choice3{
    font-size: 0.35vw;
    grid-column-start: \${choiceStart};
    grid-column-end:  \${choiceEnd};
    grid-row-start: 6;
    grid-row-end:  6;
    display: flex;
    justify-content: flex-start;
    align-items: center;
      border: 1px solid transparent;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
      padding: 1px;
  }

  dialog-choice1:hover,
  dialog-choice2:hover,
  dialog-choice3:hover{
      background-color:purple;
      color:AntiqueWhite;
  }


  dialog-submit{
      grid-column-start: 14;
      grid-column-end: span 1;
      grid-row-start: 6;
      grid-row-end: span 1;
      border: 1px solid purple;
      border-radius: 3px;
      font-size: 0.3vw;
      cursor: pointer;
      display: flex; 
      flex-direction:column; 
      justify-content: center;
      align-items: center;
      user-select: none;
  }

  dialog-submit:hover{
    background: purple;
    color:white;
  }


</style>
    <dialog-container \${===isDialogActive} >
    <dialog-inner \${!==isTransitionActive}>
      <avatar-portrait \${===isLeftVisible} style="background-image: url(\${portraitLeft}); background-size: cover;"></avatar-portrait>
      <avatar-portrait2 \${===isRightVisible} style="background-image: url(\${portraitRight}); background-size: cover;" ></avatar-portrait2>
      <dialog-content \${===isContentVisible}>\${dialogContent}</dialog-content>
      <dialog-choice1 data-index="0" \${===isChoice1Enabled} \${click@=>selectOption}>\${choice1Content}</dialog-choice1>
      <dialog-choice2 data-index="1" \${===isChoice2Enabled} \${click@=>selectOption}>\${choice2Content}</dialog-choice2>
      <dialog-choice3 data-index="2" \${===isChoice3Enabled} \${click@=>selectOption}>\${choice3Content}</dialog-choice3>
      <dialog-submit \${click@=>runNext} \${===isSubmitEnabled}><span>\${submitText}</span></dialog-submit>
    </dialog-inner>
    </dialog-container>
  `;
  confirmSignal: Signal = new Signal("confirm");
  dialogSignal: Signal = new Signal("dialog");
  custsceneSignal: Signal = new Signal("Event");
  endSignal: Signal = new Signal("dialogComplete");
  currentID: string = "";
  isDialogActive: boolean = false;
  isTransitionActive: boolean = false;
  isSubmitEnabled = true;
  submitText = "NEXT";
  isLeftVisible = false;
  isRightVisible = false;
  isContentVisible = true;
  dialogContent = "";
  shortcut = false;

  contentColStart = 3; //3 left, 1 right, 1 center
  contentColEnd = 14; //14 left, 12 right, 14 center

  portraitLeft = Assets.image("npcAvatar").src;
  portraitRight = Assets.image("heroAvatar").src;

  isChoice1Enabled = false;
  isChoice2Enabled = false;
  isChoice3Enabled = false;
  choice1Content = "Choice 1";
  choice2Content = "Choice 2";
  choice3Content = "Choice 3";
  choiceStart = 4; //2 center, 4 left, 2 right
  choiceEnd = 13; //13 center, 11, right

  choiceCallback: Function | undefined;

  public constructor() {
    this.dialogSignal.listen(this.startDialog);
    this.confirmSignal.listen(() => {
      if (this.shortcut) this.runNext();
    });
  }

  startDialog = (signalData: CustomEvent) => {
    const dialogConfig = signalData.detail.params[0];
    if (dialogConfig.template == "basic") {
      this.currentID = dialogConfig.id;
      this.dialogContent = dialogConfig.content;
      this.submitText = dialogConfig.buttonContent;
      this.contentColStart = 1;
      this.contentColEnd = 14;
      this.choiceStart = 2;
      this.choiceEnd = 13;
      this.isDialogActive = true;
      this.isTransitionActive = false;
      this.shortcut = true;
    } else if (dialogConfig.template == "left") {
      this.currentID = dialogConfig.id;
      this.shortcut = dialogConfig.shortcut;
      this.contentColEnd = 14;
      this.contentColStart = 4;
      this.choiceStart = 5;
      this.choiceEnd = 13;
      this.isLeftVisible = true;
      this.isRightVisible = false;
      this.isDialogActive = true;
      this.isTransitionActive = false;
    } else if (dialogConfig.template == "right") {
      this.shortcut = dialogConfig.shortcut;
      this.currentID = dialogConfig.id;
      this.contentColEnd = 12;
      this.contentColStart = 1;
      this.choiceStart = 2;
      this.choiceEnd = 11;

      this.isLeftVisible = false;
      this.isRightVisible = true;
      this.isDialogActive = true;
      this.isTransitionActive = false;
    } else if (dialogConfig.template == "center") {
      this.shortcut = dialogConfig.shortcut;
      this.currentID = dialogConfig.id;
      this.contentColEnd = 14;
      this.contentColStart = 1;
      this.isLeftVisible = false;
      this.isRightVisible = false;
      this.isDialogActive = true;
      this.isTransitionActive = false;
    }

    if (dialogConfig.content) {
      this.dialogContent = dialogConfig.content;
      this.isContentVisible = true;
    } else {
      this.dialogContent = "";
      this.isContentVisible = false;
    }

    if (dialogConfig.options) {
      this.choiceCallback = dialogConfig.callback;

      if (dialogConfig.options[0]) {
        this.choice1Content = dialogConfig.options[0];
        this.isChoice1Enabled = true;
      }
      if (dialogConfig.options[1]) {
        this.choice2Content = dialogConfig.options[1];
        this.isChoice2Enabled = true;
      }
      if (dialogConfig.options[2]) {
        this.choice3Content = dialogConfig.options[2];
        this.isChoice3Enabled = true;
      }
    }

    if (dialogConfig.showButton) {
      this.isSubmitEnabled = true;
      this.submitText = dialogConfig.buttonContent;
    } else this.isSubmitEnabled = false;
  };

  selectOption = (_e: any, model: any, a: any, b: any, c: any) => {
    const choice = (a as HTMLElement).getAttribute("data-index");
    if (!choice) return;
    if (this.choiceCallback) this.choiceCallback(parseInt(choice));
    this.runNext();
  };

  runNext = () => {
    this.isDialogActive = false;
    this.choice1Content = "";
    this.choice2Content = "";
    this.choice3Content = "";
    this.dialogContent = "";
    this.isChoice1Enabled = false;
    this.isChoice2Enabled = false;
    this.isChoice3Enabled = false;
    this.shortcut = false;
    this.endSignal.send([this.currentID]);
  };
}
