"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalculatorFormData,
  FixedEndMomentResults,
  SlopeDeflectionEquation,
  Span,
} from "../types/calculator";
import {
  Solution,
  solveSimultaneousEquations,
} from "../utils/boundaryCondition";
import { calculateBMSF } from "../utils/calculateBMSF";
import { calculateFinalMoments } from "../utils/calculateFinalMoments";
import { calculateReactions } from "../utils/calculateReactions";
import { calculateFixedEndMoments } from "../utils/calculations";
import { SpanCriticalPoints, extractCriticalBMSF } from "../utils/criticalBMSF";
import { generateSlopeDeflectionEquations } from "../utils/slopeDeflection";
import { LOAD_TYPES } from "../utils/loadTypes";
import SpanInputs from "./span-inputs";
import { Label } from "@/components/ui/label";

export default function FormModal() {
  const router = useRouter();
  const [formData, setFormData] = useState<CalculatorFormData>({
    modulusOfElasticity: 0,
    momentOfInertia: 0,
    numberOfSpans: 0,
    spans: [],
    sinkingSupports: [],
  });
  const [results, setResults] = useState<FixedEndMomentResults[]>([]);
  const [slopeDeflectionEquations, setSlopeDeflectionEquations] = useState<
    SlopeDeflectionEquation[]
  >([]);
  const [boundaryCondition, setBoundaryCondition] = useState<Solution>({
    thetaB: 0,
    thetaC: 0,
    thetaD: 0,
  });
  const [finalMoments, setFinalMoments] = useState<{ [key: string]: number }>(
    {}
  );
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [criticalPoints, setCriticalPoints] = useState<SpanCriticalPoints[]>(
    []
  );

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData]);

  const validateForm = () => {
    if (
      formData.modulusOfElasticity <= 0 ||
      formData.momentOfInertia <= 0 ||
      formData.numberOfSpans < 3
    ) {
      return false;
    }

    for (const span of formData.spans) {
      if (
        span.length <= 0 ||
        span.momentOfInertia <= 0 ||
        span.loadMagnitude < 0
      ) {
        return false;
      }
    }

    return true;
  };

  const handleNumberOfSpansChange = (value: number) => {
    const newSpans = Array(value)
      .fill(null)
      .map(() => ({ ...initialSpan }));
    const newSinkingSupports = Array(value + 1).fill(0);

    setFormData((prev) => ({
      ...prev,
      numberOfSpans: value,
      spans: newSpans,
      sinkingSupports: newSinkingSupports,
    }));
  };

  const handleSpanChange = (index: number, span: Span) => {
    setFormData((prev) => ({
      ...prev,
      spans: prev.spans.map((s, i) => (i === index ? span : s)),
    }));
  };

  const handleSinkingSupportChange = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      sinkingSupports: prev.sinkingSupports.map((s, i) =>
        i === index ? value : s
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate all the results
    const fixedEndMoments = formData.spans.map((span, index) => {
      const { start, end } = calculateFixedEndMoments(span);
      const spanLabel =
        String.fromCharCode(65 + index) + String.fromCharCode(66 + index);
      return {
        spanLabel,
        startMoment: start,
        endMoment: end,
      };
    });

    // Generate and calculate all other results
    const equations = generateSlopeDeflectionEquations(
      formData.spans,
      fixedEndMoments,
      formData.sinkingSupports
    );

    const equation1 = equations[0].endEquation + equations[1].startEquation;
    const equation2 = equations[1].endEquation + equations[2].startEquation;
    const lastSpan = formData.spans[formData.spans.length - 1];
    const equation3 =
      lastSpan.endSupport === "hinged" || lastSpan.endSupport === "roller"
        ? equations[2].endEquation
        : null;

    const solutions = solveSimultaneousEquations(
      equation1,
      equation2,
      equation3,
      formData.modulusOfElasticity,
      formData.momentOfInertia
    );

    const EI = formData.modulusOfElasticity * formData.momentOfInertia;

    if (solutions) {
      const moments = calculateFinalMoments(
        equations,
        solutions.thetaB,
        solutions.thetaC,
        solutions.thetaD ?? 0,
        EI
      );

      const reactions = calculateReactions(formData.spans, moments);

      const {
        results: bmsfResults,
        startReactions,
        startMoments,
      } = calculateBMSF(formData.spans, moments);

      const criticalPoints = extractCriticalBMSF(
        formData.spans,
        bmsfResults,
        startReactions,
        startMoments
      );

      // Encode all results as URL parameters
      const params = new URLSearchParams({
        results: JSON.stringify(fixedEndMoments),
        equations: JSON.stringify(equations),
        boundaryCondition: JSON.stringify(solutions),
        finalMoments: JSON.stringify(moments),
        reactions: JSON.stringify(reactions),
        criticalPoints: JSON.stringify(criticalPoints),
      });

      // Navigate to results page with data
      router.push(`/results?${params.toString()}`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="bg-white text-gray-900 hover:bg-white/90 transition-all"
        >
          Beams Calculation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Slope Deflection Calculator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Spans
              </label>
              <Input
                type="number"
                value={formData.numberOfSpans}
                onChange={(e) =>
                  handleNumberOfSpansChange(parseInt(e.target.value) || 0)
                }
                min={0}
                className="bg-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Modulus of Elasticity (E){" "}
              </label>
              <Input
                type="number"
                value={formData.modulusOfElasticity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    modulusOfElasticity: parseFloat(e.target.value) || 0,
                  }))
                }
                className="bg-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Moment of Inertia (I){" "}
              </label>
              <Input
                type="number"
                value={formData.momentOfInertia}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    momentOfInertia: parseFloat(e.target.value) || 0,
                  }))
                }
                className="bg-secondary"
              />
            </div>
          </div>

          {formData.spans.map((span, index) => (
            <div key={index} className="space-y-4">
              <SpanInputs
                span={span}
                index={index}
                onChange={(span) => handleSpanChange(index, span)}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-6 w-full ">
            {formData.sinkingSupports.map((value, index) => (
              <div key={index}>
                <Label className="block text-sm font-medium mb-1">
                  Sinking {String.fromCharCode(65 + index)}{" "}
                  <span className="text-blue-500 text-xs">(m)</span>
                </Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleSinkingSupportChange(
                      index,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="bg-secondary w-32"
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-600 via-gray-800 to-gray-700 text-white"
            disabled={!isFormValid}
          >
            SUBMIT
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const initialSpan: Span = {
  length: 0,
  momentOfInertia: 0,
  loadType: LOAD_TYPES.UDL,
  startSupport: "hinged",
  endSupport: "hinged",
  loadMagnitude: 0,
  pointLoadDistances: { a: 0, b: 0 },
};
