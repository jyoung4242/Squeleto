/*
  Copyright 2020 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

export type Note = {
  note: number | "---" | "cont";
  fx?: {
    pulseWidth?: number;
    glide?: number;
  };
  vel?: number;
};
export type Drum = {
  drum: "---" | "KCK" | "NSS" | "SNR";
  vel?: number;
};

export type Slot = Note | Drum;

export type Pattern<T> = T[];

export type Key = number & { keyType: true };

export type Progression = number[];
export type Scale = number[];
