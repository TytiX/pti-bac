
interface WordValidation {
  [userid: string]: boolean
}
export interface WordCorrection {
  word: string;
  validations: WordValidation;
}

export interface UserWordCorrection {
  [userId: string]: WordCorrection;
}

export interface Correction {
  [categorieId: number]: UserWordCorrection;
}
