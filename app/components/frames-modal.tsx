"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Beam, Column } from "../types/frameTypes";
import { calculateFrameFixedEndMoments } from "../utils/femFrames";
import { calculateBeamBMSF, calculateColumnBMSF } from "../utils/frameBMSF";
import { generalFrameEquation } from "../utils/frameBoundaryCondition";
import {
  calculateFrameHorizontalReactions,
  calculateFrameVerticalReactions,
} from "../utils/frameReactions";
import { calculateFrameFinalMoments } from "../utils/framesFinalMoments";
import {
  generateFrameShearEquation,
  simplifyFrameShearEquation,
  solveFrameEquations,
} from "../utils/frameShearEquation";
import { generateFrameSlopeDeflectionEquations } from "../utils/frameSlopeDeflection";
import BeamForm from "./beam-form";
import ColumnForm from "./column-form";

export default function FramesModal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    numberOfColumns: 0,
    numberOfBeams: 0,
    columns: [] as Column[],
    beams: [] as Beam[],
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData]);

  const validateForm = () => {
    if (formData.numberOfColumns === 0 || formData.numberOfBeams === 0) {
      return false;
    }

    // Validate columns
    for (const column of formData.columns) {
      if (column.length <= 0 || column.momentOfInertia <= 0) {
        return false;
      }
    }

    // Validate beams
    for (const beam of formData.beams) {
      if (beam.length <= 0 || beam.momentOfInertia <= 0) {
        return false;
      }
    }

    return true;
  };

  const handleNumberOfColumnsChange = (value: number) => {
    const newColumns = Array(value)
      .fill(null)
      .map(() => ({ ...initialColumn }));
    setFormData((prev) => ({
      ...prev,
      numberOfColumns: value,
      columns: newColumns,
    }));
  };

  const handleNumberOfBeamsChange = (value: number) => {
    const newBeams = Array(value)
      .fill(null)
      .map(() => ({ ...initialBeam }));
    setFormData((prev) => ({
      ...prev,
      numberOfBeams: value,
      beams: newBeams,
    }));
  };

  const handleColumnChange = (
    index: number,
    field: keyof Column,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col
      ),
    }));
  };

  const handleBeamChange = (index: number, field: keyof Beam, value: any) => {
    setFormData((prev) => ({
      ...prev,
      beams: prev.beams.map((beam, i) =>
        i === index ? { ...beam, [field]: value } : beam
      ),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const columnResults = formData.columns.map((column, index) => ({
      label: `Column ${index + 1}`,
      ...calculateFrameFixedEndMoments(column),
    }));

    const beamResults = formData.beams.map((beam, index) => ({
      label: `Beam ${index + 1}`,
      ...calculateFrameFixedEndMoments(beam),
    }));

    // Generate slope deflection equations
    const slopeDeflectionEquations = generateFrameSlopeDeflectionEquations(
      formData.columns,
      formData.beams,
      [...columnResults, ...beamResults]
    );

    // Check if any column has a hinge or roller support
    const hasHingeOrRoller = formData.columns.some(
      (column) =>
        column.supportType === "hinged" || column.supportType === "roller"
    );

    // Get boundary equations
    const boundaryEquations = generalFrameEquation(
      slopeDeflectionEquations,
      hasHingeOrRoller
    );

    // Calculate shear equation and simplify it
    const shearEquation = generateFrameShearEquation(
      formData.columns,
      slopeDeflectionEquations
    );

    const simplifiedShearEquation = simplifyFrameShearEquation(
      shearEquation.shearEquation
    );

    // Solve the system of equations
    const solution = solveFrameEquations(
      boundaryEquations?.eq1 || "",
      boundaryEquations?.eq2 || "",
      boundaryEquations?.eq3 || null,
      simplifiedShearEquation.simplifiedEquation
    );

    const finalMoments = calculateFrameFinalMoments(
      slopeDeflectionEquations,
      formData.columns,
      solution.thetaB,
      solution.thetaC,
      solution.thetaD,
      solution.delta,
      1 // Since we're working with EI terms directly
    );

    // Calculate horizontal reactions
    const horizontalReactions = calculateFrameHorizontalReactions(
      formData.columns,
      finalMoments
    );

    // Add vertical reactions calculation
    const verticalReactions = calculateFrameVerticalReactions(
      formData.beams,
      finalMoments
    );

    // Calculate BMSF for columns and beams
    const columnBMSF = formData.columns.map((column, index) =>
      calculateColumnBMSF(column, index, finalMoments, horizontalReactions)
    );

    const beamBMSF = formData.beams.map((beam) =>
      calculateBeamBMSF(
        beam,
        finalMoments[`MBCs`] || 0, // Start moment for beam
        verticalReactions
      )
    );

    // Prepare results for URL parameters
    const results = {
      columns: columnResults,
      beams: beamResults,
      slopeDeflectionEquations,
      boundaryEquations,
      shearEquation: {
        ...shearEquation,
        simplifiedEquation: simplifiedShearEquation,
      },
      solution,
      finalMoments,
      horizontalReactions,
      verticalReactions,
      columnBMSF, // Add BMSF results
      beamBMSF, // Add BMSF results
    };

    // Encode results as URL parameters
    const params = new URLSearchParams({
      results: JSON.stringify(results),
    });

    // Navigate to results page with data
    router.push(`/frames?${params.toString()}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="bg-white text-gray-900 hover:bg-white/90 transition-all"
        >
          Frames
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Frames Analysis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Columns</Label>
              <Input
                type="number"
                value={formData.numberOfColumns}
                onChange={(e) =>
                  handleNumberOfColumnsChange(parseInt(e.target.value) || 0)
                }
                min={0}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Beams</Label>
              <Input
                type="number"
                value={formData.numberOfBeams}
                onChange={(e) =>
                  handleNumberOfBeamsChange(parseInt(e.target.value) || 0)
                }
                min={0}
                className="bg-secondary"
              />
            </div>
          </div>

          {formData.columns.length > 0 && (
            <ColumnForm
              columns={formData.columns}
              onColumnChange={handleColumnChange}
            />
          )}

          {formData.beams.length > 0 && (
            <BeamForm beams={formData.beams} onBeamChange={handleBeamChange} />
          )}

          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 hover:from-blue-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white"
            disabled={!isFormValid}
          >
            Calculate Frame
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const initialColumn: Column = {
  length: 0,
  momentOfInertia: 0,
  supportType: "fixed",
  loadType: "NONE",
  loadMagnitude: 0,
};

const initialBeam: Beam = {
  length: 0,
  momentOfInertia: 0,
  loadMagnitude: 0,
  loadType: "NONE",
};
