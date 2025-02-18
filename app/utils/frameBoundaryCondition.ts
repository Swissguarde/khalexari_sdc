import { FrameSlopeDeflectionEquation } from "./frameSlopeDeflection";

export type FrameSolution = {
  thetaB: number;
  thetaC: number;
  thetaD?: number;
  delta: number;
} | null;

// Update return type to include optional third equation
export type BoundaryEquations = {
  eq1: string;
  eq2: string;
  eq3?: string;
} | null;

// Helper function to format a coefficient
const formatCoefficient = (coeff: number): string => {
  if (Math.abs(coeff) === 1) return "";
  return Math.abs(coeff).toFixed(2);
};

// Helper function to format equations
const formatEquation = (equation: string): string => {
  // Remove spaces and split into terms
  const terms = equation
    .replace(/\s+/g, "")
    .split(/([+-])/g)
    .filter(Boolean);

  let coeffB = 0;
  let coeffC = 0;
  let coeffDelta = 0;
  let constants = 0;
  let currentMultiplier = 1;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];

    if (term === "+" || term === "-") {
      currentMultiplier = term === "+" ? 1 : -1;
      continue;
    }

    // Parse the term
    if (term.includes("EIθB")) {
      const coeff = parseFloat(term.split("EIθB")[0]) || 1;
      coeffB += coeff * currentMultiplier;
    } else if (term.includes("EIθC")) {
      const coeff = parseFloat(term.split("EIθC")[0]) || 1;
      coeffC += coeff * currentMultiplier;
    } else if (term.includes("EIδ")) {
      const coeff = parseFloat(term.split("EIδ")[0]) || 1;
      coeffDelta += coeff * currentMultiplier;
    } else if (!isNaN(parseFloat(term))) {
      constants += parseFloat(term) * currentMultiplier;
    }
  }

  // Build simplified equation
  const parts: string[] = [];

  if (coeffB !== 0) {
    parts.push(`${formatCoefficient(coeffB)}EIθB`);
  }
  if (coeffC !== 0) {
    parts.push(`${formatCoefficient(coeffC)}EIθC`);
  }
  if (coeffDelta !== 0) {
    parts.push(`${formatCoefficient(coeffDelta)}EIδ`);
  }
  if (constants !== 0) {
    parts.push(Math.abs(constants).toFixed(2));
  }

  return parts
    .map((term, index) => {
      if (index === 0) {
        return [coeffB, coeffC, coeffDelta, constants][index] < 0
          ? `-${term}`
          : term;
      }
      const coefficients = [coeffB, coeffC, coeffDelta, constants];
      return coefficients[index] < 0 ? ` - ${term}` : ` + ${term}`;
    })
    .join("");
};

export const getFrameBoundaryEquations = (
  equations: FrameSlopeDeflectionEquation[],
  hasHingeOrRoller: boolean
): BoundaryEquations => {
  try {
    const c1End = equations.find((eq) => eq.memberLabel === "C1")?.endEquation;
    const beamStart = equations.find(
      (eq) => eq.memberLabel === "BC"
    )?.startEquation;
    const beamEnd = equations.find(
      (eq) => eq.memberLabel === "BC"
    )?.endEquation;
    const c2Start = equations.find(
      (eq) => eq.memberLabel === "C2"
    )?.startEquation;
    const c2End = equations.find((eq) => eq.memberLabel === "C2")?.endEquation;

    if (!c1End || !beamStart || !beamEnd || !c2Start || !c2End) {
      throw new Error("Missing required equations");
    }

    const baseEquations = {
      eq1: formatEquation(c1End + " + " + beamStart),
      eq2: formatEquation(beamEnd + " + " + c2Start),
    };

    // Add third equation if there's a hinge or roller
    if (hasHingeOrRoller && c2End) {
      return {
        ...baseEquations,
        eq3: c2End,
      };
    }

    return baseEquations;
  } catch (error) {
    console.error("Error getting frame equations:", error);
    return null;
  }
};
