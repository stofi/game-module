import seed from 'seed-random';

let fn: () => number;

export function setSeed(s: string) {
  fn = seed(s);
}


export function random() {
  return fn();
}