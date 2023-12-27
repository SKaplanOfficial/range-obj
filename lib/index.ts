import { Range } from "./types";
import { generateID } from "./utils";

export { Range } from "./types";

/**
 * Creates a new {@link Range} object.
 * @param startIndex The start value of the range.
 * @param endIndex The end value of the range.
 * @returns {Range} A new {@link Range} object.
 */
export function range(start: number, end: number, step = 1): Range {
  const id = generateID("RG");
  return {
    start,

    end,

    step,

    id,

    itemType: "range",

    length: end - start,

    average: () => (start + end) / 2,

    sum: () => {
      let sum = 0;
      for (let i = start; i <= end; i += step) {
        sum += i;
      }
      return sum;
    },

    mapValue: (s: number, to: Range) => to.start + ((s - start) * (to.end - to.start)) / (end - start),

    intersection: (otherRange: Range) => {
      const overallStart = Math.max(start, otherRange.start);
      const overallEnd = Math.min(end, otherRange.end);

      if (step !== otherRange.step) {
        const maxStep = Math.max(step, otherRange.step || 1);

        let lowestSharedStart = Math.max(start, otherRange.start);
        let highestSharedEnd = Math.min(end, otherRange.end);

        while (lowestSharedStart % maxStep !== 0) {
          lowestSharedStart += 1;
        }

        while (highestSharedEnd % maxStep !== 0) {
          highestSharedEnd -= 1;
        }

        return range(lowestSharedStart, highestSharedEnd, maxStep);
      }

      if (overallEnd < overallStart) {
        return undefined;
      }
      return range(overallStart, overallEnd);
    },

    intersects: (otherRange: Range) => {
      const overallStart = Math.max(start, otherRange.start);
      const overallEnd = Math.min(end, otherRange.end);
      return overallEnd >= overallStart && (otherRange.step || 1) < end - start;
    },

    union: (otherRange: Range) => {
      if (step !== otherRange.step) {
        throw new Error("Cannot union ranges with different step sizes.");
      }

      const overallStart = Math.min(start, otherRange.start);
      const overallEnd = Math.max(end, otherRange.end);
      return range(overallStart, overallEnd);
    },

    transform: (value_transformer: (value: number) => number, step_transformer?: (step: number) => number) => {
      const newStart = value_transformer(start);
      const newEnd = value_transformer(end);
      const newStep = step_transformer ? step_transformer(step) : step;
      return range(newStart, newEnd, newStep);
    },

    multiply: (value: number) => range(start * value, end * value, step * value),
    divide: (value: number) => range(start / value, end / value, step / value),
    add: (value: number) => range(start + value, end + value, step),
    subtract: (value: number) => range(start - value, end - value, step),

    contains: (value: number | Range) => {
      if (step !== 1) {
        // Step is not 1, so we need to check for multiples of the step.
        if (typeof value === "number") {
          // Value is a number, so we can just check that it is a multiple of the step and is in the range.
          return (value - start) % step === 0 && value >= start && value <= end;
        }

        // Value is a range, so we need to check that all values in the range are contained in this one.
        for (let i = value.start; i <= value.end; i += step) {
          if (!range(start, end).contains(i)) {
            return false;
          }
        }
        return true;
      }

      // Step is 1, so we only need to check that the value(s) is/are within the range.
      if (typeof value === "number") {
        return value >= start && value <= end;
      }
      return value.start >= start && value.end <= end;
    },

    toJSON: () => ({
      start,
      end,
      step,
    }),

    toArray: () => {
      const array: number[] = [];
      for (let i = start; i <= end; i += step) {
        array.push(i);
      }
      return array;
    },

    toString: () => `[${start}, ${end}, ${step}]`,

    equals: (otherRange: Range) => start === otherRange.start && end === otherRange.end && step === otherRange.step,
  };
}
