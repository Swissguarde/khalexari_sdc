"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BMSFCharts from "../components/charts";
import {
  FixedEndMomentResults,
  SlopeDeflectionEquation,
} from "../types/calculator";
import { SpanCriticalPoints } from "../utils/criticalBMSF";

export default function ResultsPage() {
  const searchParams = useSearchParams();

  // Parse URL parameters
  const results = JSON.parse(searchParams.get("results") || "[]");
  const equations = JSON.parse(searchParams.get("equations") || "[]");
  const boundaryCondition = JSON.parse(
    searchParams.get("boundaryCondition") || "{}"
  );
  const finalMoments = JSON.parse(searchParams.get("finalMoments") || "{}") as {
    [key: string]: number;
  };
  const reactions = JSON.parse(searchParams.get("reactions") || "{}") as {
    [key: string]: number;
  };
  const criticalPoints = JSON.parse(searchParams.get("criticalPoints") || "[]");

  return (
    <div className="p-12 min-h-screen bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 text-white">
      <div className="flex items-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Calculator
        </Link>
        <h2 className="text-4xl font-bold flex-1 text-center">Results</h2>
        <div className="invisible">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Calculator
          </Link>
        </div>
      </div>
      <div className="space-y-6">
        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Fixed End Moments</h2>
          <div className="space-y-2">
            {results.map((result: FixedEndMomentResults) => (
              <div
                key={result.spanLabel}
                className="border-b border-gray-600 pb-4"
              >
                <p>Span {result.spanLabel}:</p>
                <p className="pl-4">
                  FEM{result.spanLabel}: {result.startMoment.toFixed(2)}{" "}
                  <span className="text-sm text-green-400">KNM</span>
                </p>
                <p className="pl-4">
                  FEM{result.spanLabel.split("").reverse().join("")}:{" "}
                  {result.endMoment.toFixed(2)}{" "}
                  <span className="text-sm text-green-400">KNM</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">
            Slope Deflection Equations
          </h3>
          <div className="space-y-2">
            {equations.map((eq: SlopeDeflectionEquation) => {
              if (!eq.startEquation && !eq.endEquation) return null;

              return (
                <div
                  key={eq.spanLabel}
                  className="border-b border-gray-600 pb-4"
                >
                  <p>Span {eq.spanLabel}:</p>
                  <div className="pl-4 space-y-2">
                    {eq.startEquation && (
                      <p>
                        M{eq.spanLabel} ={" "}
                        <span className="font-bold">{eq.startEquation}</span>
                      </p>
                    )}
                    {eq.endEquation && (
                      <p>
                        M{eq.spanLabel.split("").reverse().join("")} ={" "}
                        <span className="font-bold">{eq.endEquation}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {boundaryCondition && (
          <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Boundary Conditions</h3>
            <div className="space-y-2">
              <p className="pl-4">θB = {boundaryCondition.thetaB.toFixed(6)}</p>
              <p className="pl-4">θC = {boundaryCondition.thetaC.toFixed(6)}</p>
              {boundaryCondition.thetaD !== undefined && (
                <p className="pl-4">
                  θD = {boundaryCondition.thetaD.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}
        {finalMoments && Object.keys(finalMoments).length > 0 && (
          <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Final Moments</h3>
            <div className="space-y-2">
              {Object.entries(finalMoments).map(([key, value]) => (
                <p key={key} className="pl-4">
                  {key} = <span className="font-bold">{value.toFixed(2)}</span>{" "}
                  <span className="text-sm text-green-400">KNM</span>
                </p>
              ))}
            </div>
          </div>
        )}
        {reactions && Object.keys(reactions).length > 0 && (
          <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Support Reactions</h3>
            <div className="space-y-2">
              {Object.entries(reactions).map(([key, value]) => (
                <p key={key} className="pl-4">
                  {key} = <span className="font-bold">{value.toFixed(2)}</span>{" "}
                  <span className="text-sm text-green-400">KN</span>
                </p>
              ))}
            </div>
          </div>
        )}
        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">
            Bending Moments and Shear Forces
          </h3>
          <div className="space-y-6">
            {criticalPoints?.map((span: SpanCriticalPoints) => (
              <div
                key={span.spanLabel}
                className="border border-gray-600 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-600 px-4 py-2">
                  <p className="font-semibold">Span {span.spanLabel}</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-2 text-gray-400 text-sm">
                    <div>Location</div>
                    <div>Bending Moment</div>
                    <div>Shear Force</div>
                  </div>
                  {span.criticalPoints.map((point, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-3 gap-4 py-2 ${
                        index !== span.criticalPoints.length - 1
                          ? "border-b border-gray-600"
                          : ""
                      }`}
                    >
                      <div className="text-gray-200">{point.location}</div>
                      <div>
                        <span className="font-bold">
                          {point.bendingMoment.toFixed(2)}
                        </span>{" "}
                        <span className="text-sm text-green-400">KNm</span>
                      </div>
                      <div>
                        <span className="font-bold">
                          {point.shearForce.toFixed(2)}
                        </span>{" "}
                        <span className="text-sm text-green-400">KN</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {criticalPoints && criticalPoints.length > 0 && (
          <div className="mt-8">
            <BMSFCharts criticalPoints={criticalPoints} />
          </div>
        )}
      </div>
    </div>
  );
}
