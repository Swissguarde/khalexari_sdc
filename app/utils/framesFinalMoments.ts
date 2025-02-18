import { FrameSlopeDeflectionEquation } from "./frameSlopeDeflection";

export interface FrameFinalMoments {
  [key: string]: number;
}

interface Coefficients {
  constant: number;
  thetaB: number;
  thetaC: number;
  delta: number;
}

export const calculateFrameFinalMoments = (
  equations: FrameSlopeDeflectionEquation[],
  thetaB: number,
  thetaC: number,
  delta: number,
  EI: number
): FrameFinalMoments => {
  const moments: FrameFinalMoments = {};

  equations.forEach((equation) => {
    // Calculate start moment
    const startCoefficients = parseFrameEquation(equation.startEquation);
    const startMomentKey = `M${equation.memberLabel}s`;
    moments[startMomentKey] = calculateFrameMoment(
      startCoefficients,
      thetaB,
      thetaC,
      delta,
      EI
    );

    // Calculate end moment
    const endCoefficients = parseFrameEquation(equation.endEquation);
    const endMomentKey = `M${equation.memberLabel}e`;
    moments[endMomentKey] = calculateFrameMoment(
      endCoefficients,
      thetaB,
      thetaC,
      delta,
      EI
    );
  });

  return moments;
};

const parseFrameEquation = (equation: string): Coefficients => {
  const coefficients: Coefficients = {
    constant: 0,
    thetaB: 0,
    thetaC: 0,
    delta: 0,
  };

  // Extract constant terms (standalone numbers not part of EI terms)
  const constantMatches = equation.match(
    /(?<!EI.*)([+-]?\s*\d*\.?\d+)(?!\s*EI|\s*\.?\d*\s*EI)/g
  );
  if (constantMatches) {
    coefficients.constant = constantMatches
      .map((num) => parseFloat(num.replace(/\s+/g, "")))
      .reduce((sum, num) => sum + num, 0);
  }

  // Extract θB coefficient
  if (equation.includes("EIθB")) {
    const thetaBMatch = equation.match(/([+-]?\s*\d*\.?\d+)?EIθB/);
    const coefficient = thetaBMatch?.[1]?.replace(/\s+/g, "");
    coefficients.thetaB = coefficient ? parseFloat(coefficient) : 1;
  }

  // Extract θC coefficient
  if (equation.includes("EIθC")) {
    const thetaCMatch = equation.match(/([+-]?\s*\d*\.?\d+)?EIθC/);
    const coefficient = thetaCMatch?.[1]?.replace(/\s+/g, "");
    coefficients.thetaC = coefficient ? parseFloat(coefficient) : 1;
  }

  // Extract δ coefficient
  if (equation.includes("EIδ")) {
    const deltaMatch = equation.match(/([+-]?\s*\d*\.?\d+)?EIδ/);
    const coefficient = deltaMatch?.[1]?.replace(/\s+/g, "");
    coefficients.delta = coefficient ? parseFloat(coefficient) : 1;
  }

  return coefficients;
};

const calculateFrameMoment = (
  coefficients: Coefficients,
  thetaB: number,
  thetaC: number,
  delta: number,
  EI: number
): number => {
  return (
    coefficients.constant +
    coefficients.thetaB * thetaB +
    coefficients.thetaC * thetaC +
    coefficients.delta * delta
  );
};
