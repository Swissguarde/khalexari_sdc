import { CalculationResults } from "../../types/frameTypes";

interface FrameBMSFChartsProps {
  results: CalculationResults;
}

export default function FrameShearForceDiagram({
  results,
}: FrameBMSFChartsProps) {
  // SVG dimensions and scaling
  const svgHeight = 700;
  const svgWidth = 1000;
  const margin = { top: 60, right: 80, bottom: 60, left: 80 };

  // Frame dimensions
  const frameWidth = svgWidth - margin.left - margin.right;
  const frameHeight = svgHeight - margin.top - margin.bottom;
  const columnWidth = frameWidth * 0.3; // Width allocated for each column's diagram
  const beamHeight = frameHeight * 0.3; // Height allocated for beam's diagram

  // Calculate frame centerlines
  const leftColumnX = margin.left + columnWidth / 2;
  const rightColumnX = svgWidth - margin.right - columnWidth / 2;
  const beamY = margin.top + frameHeight / 3; // Position beam in upper third

  // Process data and calculate scales
  const maxColumnHeight = Math.max(
    ...(results.columnBMSF?.[0]?.sections?.flatMap((s) => s.x) ?? [0]),
    ...(results.columnBMSF?.[1]?.sections?.flatMap((s) => s.x) ?? [0])
  );

  const maxColumnShear = Math.max(
    ...(results.columnBMSF?.[0]?.sections
      ?.flatMap((s) => s.shearForce)
      ?.map(Math.abs) ?? [0]),
    ...(results.columnBMSF?.[1]?.sections
      ?.flatMap((s) => s.shearForce)
      ?.map(Math.abs) ?? [0])
  );

  const maxBeamLength = Math.max(...(results.beamBMSF?.[0]?.x ?? [0]));
  const maxBeamShear = Math.max(
    ...(results.beamBMSF?.[0]?.shearForce?.map(Math.abs) ?? [0])
  );

  // Scale factors
  const heightScale = frameHeight / maxColumnHeight;
  const columnShearScale = columnWidth / (2 * maxColumnShear);
  const beamLengthScale = (rightColumnX - leftColumnX) / maxBeamLength;
  const beamShearScale = beamHeight / (2 * maxBeamShear);

  // Generate paths
  const generateColumnPath = (columnIndex: number) => {
    if (!results.columnBMSF?.[columnIndex]?.sections?.length) {
      return ""; // Return empty path if no data
    }

    const baseX = columnIndex === 0 ? leftColumnX : rightColumnX;
    const points = results.columnBMSF[columnIndex].sections.flatMap((section) =>
      section.x.map((x, i) => {
        const height = Math.min(
          x * heightScale,
          svgHeight - margin.bottom - beamY
        );
        return {
          x:
            baseX +
            (columnIndex === 0 ? -1 : 1) *
              (section.shearForce[i] ?? 0) *
              columnShearScale,
          y: svgHeight - margin.bottom - height,
        };
      })
    );

    if (points.length === 0) return ""; // Return empty path if no points

    // Create closed path by adding points back along the column centerline
    const pathD =
      points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(" ") +
      // Draw horizontal line to centerline
      ` L ${baseX} ${points[points.length - 1].y}` +
      // Draw down the centerline
      ` L ${baseX} ${svgHeight - margin.bottom}` +
      // Draw horizontal line to first point
      ` L ${points[0].x} ${svgHeight - margin.bottom}` +
      // Close the path
      " Z";

    return pathD;
  };

  const generateBeamPath = () => {
    if (
      !results.beamBMSF?.[0]?.x?.length ||
      !results.beamBMSF[0].shearForce?.length
    ) {
      return ""; // Return empty path if no data
    }

    const points = results.beamBMSF[0].x.map((x, i) => ({
      x: leftColumnX + x * beamLengthScale,
      y: beamY - (results.beamBMSF[0].shearForce[i] ?? 0) * beamShearScale,
    }));

    if (points.length === 0) return ""; // Return empty path if no points

    // Create closed path by adding points back along the beam centerline
    const pathD =
      points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(" ") +
      // Draw vertical line to centerline
      ` L ${points[points.length - 1].x} ${beamY}` +
      // Draw along the centerline
      ` L ${points[0].x} ${beamY}` +
      // Close the path
      " Z";

    return pathD;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-2xl font-semibold text-white/90 flex items-center gap-3">
          <svg
            className="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Shear Force Diagram
        </h3>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <svg width={svgWidth} height={svgHeight}>
          {/* Grid lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={margin.left}
                y1={margin.top + (frameHeight * i) / 9}
                x2={svgWidth - margin.right}
                y2={margin.top + (frameHeight * i) / 9}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <line
                x1={margin.left + (frameWidth * i) / 9}
                y1={margin.top}
                x2={margin.left + (frameWidth * i) / 9}
                y2={svgHeight - margin.bottom}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Frame centerlines with updated style */}
          {results.columnBMSF?.map(
            (column, index) =>
              column?.sections?.length > 0 && (
                <line
                  key={`centerline-${index}`}
                  x1={index === 0 ? leftColumnX : rightColumnX}
                  y1={svgHeight - margin.bottom}
                  x2={index === 0 ? leftColumnX : rightColumnX}
                  y2={beamY}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
              )
          )}

          {/* Updated beam centerline */}
          {results.beamBMSF?.[0]?.x?.length > 0 && (
            <line
              x1={leftColumnX}
              y1={beamY}
              x2={rightColumnX}
              y2={beamY}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          )}

          {/* Updated diagram styles */}
          {results.columnBMSF?.map(
            (column, index) =>
              column?.sections?.length > 0 && (
                <path
                  key={`column-${index}`}
                  d={generateColumnPath(index)}
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="rgb(56, 189, 248)"
                  strokeWidth="2"
                  className="filter drop-shadow-md"
                />
              )
          )}

          {results.beamBMSF?.[0]?.x?.length > 0 && (
            <path
              d={generateBeamPath()}
              fill="rgba(56, 189, 248, 0.15)"
              stroke="rgb(56, 189, 248)"
              strokeWidth="2"
              className="filter drop-shadow-md"
            />
          )}

          {/* Shear force values */}
          {results.columnBMSF?.map((column, colIndex) =>
            column?.sections?.map((section, sectionIndex) =>
              section.shearForce.map((force, i) => {
                if (force === undefined) return null;
                const height = Math.min(
                  (section.x[i] ?? 0) * heightScale,
                  svgHeight - margin.bottom - beamY
                );
                return (
                  <text
                    key={`force-${colIndex}-${sectionIndex}-${i}`}
                    x={
                      (colIndex === 0 ? leftColumnX : rightColumnX) +
                      (colIndex === 0 ? -1 : 1) * force * columnShearScale
                    }
                    y={svgHeight - margin.bottom - height - 10}
                    textAnchor={force >= 0 ? "end" : "start"}
                    fill="white"
                    fontSize="12"
                  >
                    {force.toFixed(1)} kN
                  </text>
                );
              })
            )
          )}

          {/* Beam shear forces and max moment */}
          {results.beamBMSF?.[0]?.shearForce?.map((force, i) => {
            if (force === undefined) return null;
            const x = results.beamBMSF[0].x[i] ?? 0;

            // Only show labels for start, end, and zero shear force points
            if (
              x === 0 || // Start point
              x === results.beamBMSF[0].x[results.beamBMSF[0].x.length - 1] || // End point
              force === 0 // Zero shear force point (max moment)
            ) {
              if (
                force === 0 &&
                results.beamBMSF?.[0]?.bendingMoment?.[i] !== undefined
              ) {
                // Show max moment at zero shear force point
                return (
                  <text
                    key={`beam-force-${i}`}
                    x={leftColumnX + x * beamLengthScale + 5}
                    y={beamY - 5}
                    textAnchor="start"
                    fill="white"
                    fontSize="12"
                  >
                    {results.beamBMSF[0].bendingMoment[i].toFixed(1)} kN⋅m
                  </text>
                );
              } else {
                // Show shear force values for start and end points
                return (
                  <text
                    key={`beam-force-${i}`}
                    x={leftColumnX + x * beamLengthScale + 5}
                    y={beamY - force * beamShearScale - 5}
                    textAnchor="start"
                    fill="white"
                    fontSize="12"
                  >
                    {force.toFixed(1)} kN
                  </text>
                );
              }
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}
