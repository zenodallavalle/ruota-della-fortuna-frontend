export default interface GameData {
  sentenceToGuess: string;
  suggestion: string;
  usedLetters: string;
  notFoundLetters: string;
  roundExpress: boolean;
  showNotFoundLetters: boolean;
}
