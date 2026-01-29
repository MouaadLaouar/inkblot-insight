export function getRangeSet(key: string): { min: number | null; max: number | null } {
  let rangeSet: [number | null, number | null] = [null, null];

  switch (key) {
    case "G":
      rangeSet = [20, 30];
      break;
    case "D":
      rangeSet = [68, 70];
      break;
    case "Dd":
      rangeSet = [6, 10];
      break;
    case "Dbl":
      rangeSet = [1, 3];
      break;
    case "F+":
      rangeSet = [80, 85];
      break;
    case "A":
      rangeSet = [35, 50];
      break;
    case "H":
      rangeSet = [15, 20];
      break;
    default:
      rangeSet = [1, 100];
      break;
  }

  return { min: rangeSet[0], max: rangeSet[1] };
}
