import { CalculationResults } from "../../types/frameTypes";

interface FrameBendingMomentDiagramProps {
  results: CalculationResults;
}

export default function FrameBendingMomentDiagram({
  results,
}: FrameBendingMomentDiagramProps) {
  // SVG dimensions and scaling
  const svgHeight = 700;
  const svgWidth = 1000;
  const margin = { top: 60, right: 80, bottom: 60, left: 80 };

  // Frame dimensions
  const frameWidth = svgWidth - margin.left - margin.right;
  const frameHeight = svgHeight - margin.top - margin.bottom;
  const columnWidth = frameWidth * 0.3;
  const beamHeight = frameHeight * 0.3;

  // Calculate frame centerlines
  const leftColumnX = margin.left + columnWidth / 2;
  const rightColumnX = svgWidth - margin.right - columnWidth / 2;
  const beamY = margin.top + frameHeight / 3;

  // Process data and calculate scales
  const maxColumnHeight = Math.max(
    ...results.columnBMSF[0].sections.flatMap((s) => s.x),
    ...results.columnBMSF[1].sections.flatMap((s) => s.x)
  );
  const maxColumnMoment = Math.max(
    ...results.columnBMSF[0].sections
      .flatMap((s) => s.bendingMoment)
      .map(Math.abs),
    ...results.columnBMSF[1].sections
      .flatMap((s) => s.bendingMoment)
      .map(Math.abs)
  );
  const maxBeamLength = Math.max(...results.beamBMSF[0].x);
  const maxBeamMoment = Math.max(
    ...results.beamBMSF[0].bendingMoment.map(Math.abs)
  );

  // Scale factors
  const heightScale = frameHeight / maxColumnHeight;
  const columnMomentScale = columnWidth / (2 * maxColumnMoment);
  const beamLengthScale = (rightColumnX - leftColumnX) / maxBeamLength;
  const beamMomentScale = beamHeight / (2 * maxBeamMoment);

  // Generate paths
  const generateColumnPath = (columnIndex: number) => {
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
            (columnIndex === 0 ? 1 : -1) * // Reversed direction from SF diagram
              section.bendingMoment[i] *
              columnMomentScale,
          y: svgHeight - margin.bottom - height,
          moment: section.bendingMoment[i],
        };
      })
    );

    // Create rectangular segments
    let pathD = "";
    for (let i = 0; i < points.length - 1; i++) {
      pathD += `M ${baseX} ${points[i].y}`;
      pathD += `L ${points[i].x} ${points[i].y}`;
      pathD += `L ${points[i + 1].x} ${points[i + 1].y}`;
      pathD += `L ${baseX} ${points[i + 1].y} Z`;
    }

    return pathD;
  };

  const generateBeamPath = () => {
    const points = results.beamBMSF[0].x.map((x, i) => ({
      x: leftColumnX + x * beamLengthScale,
      y: beamY + results.beamBMSF[0].bendingMoment[i] * beamMomentScale, // Note: positive is down
      moment: results.beamBMSF[0].bendingMoment[i],
    }));

    // Create curved path for beam
    const pathD =
      `M ${points[0].x} ${beamY} ` +
      points.map((p, i) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${points[points.length - 1].x} ${beamY} Z`;

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
          Bending Moment Diagram
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
          <line
            x1={leftColumnX}
            y1={svgHeight - margin.bottom}
            x2={leftColumnX}
            y2={beamY}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <line
            x1={rightColumnX}
            y1={svgHeight - margin.bottom}
            x2={rightColumnX}
            y2={beamY}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <line
            x1={leftColumnX}
            y1={beamY}
            x2={rightColumnX}
            y2={beamY}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* Updated diagram styles */}
          <path
            d={generateColumnPath(0)}
            fill="rgba(56, 189, 248, 0.15)"
            stroke="rgb(56, 189, 248)"
            strokeWidth="2"
            className="filter drop-shadow-md"
          />
          <path
            d={generateColumnPath(1)}
            fill="rgba(56, 189, 248, 0.15)"
            stroke="rgb(56, 189, 248)"
            strokeWidth="2"
            className="filter drop-shadow-md"
          />
          <path
            d={generateBeamPath()}
            fill="rgba(56, 189, 248, 0.15)"
            stroke="rgb(56, 189, 248)"
            strokeWidth="2"
            className="filter drop-shadow-md"
          />

          {/* Updated text styles */}
          {results.columnBMSF.map((column, colIndex) =>
            column.sections.flatMap((section, sectionIndex) =>
              section.bendingMoment.map((moment, i) => {
                const height = Math.min(
                  section.x[i] * heightScale,
                  svgHeight - margin.bottom - beamY
                );
                return (
                  <text
                    key={`moment-${colIndex}-${sectionIndex}-${i}`}
                    x={
                      (colIndex === 0 ? leftColumnX : rightColumnX) +
                      (colIndex === 0 ? 1 : -1) * moment * columnMomentScale
                    }
                    y={svgHeight - margin.bottom - height - 10}
                    textAnchor={moment >= 0 ? "start" : "end"}
                    fill="rgba(255,255,255,0.9)"
                    fontSize="13"
                    fontWeight="500"
                    className="filter drop-shadow"
                  >
                    {moment.toFixed(1)} kNm
                  </text>
                );
              })
            )
          )}

          {results.beamBMSF[0].bendingMoment.map((moment, i) => {
            const x = results.beamBMSF[0].x[i];

            // Only show labels for start, end, and maximum moment points
            if (
              x === 0 || // Start point
              x === results.beamBMSF[0].x[results.beamBMSF[0].x.length - 1] || // End point
              Math.abs(moment) ===
                Math.max(...results.beamBMSF[0].bendingMoment.map(Math.abs)) // Max moment point
            ) {
              return (
                <text
                  key={`beam-moment-${i}`}
                  x={leftColumnX + x * beamLengthScale + 5}
                  y={beamY + moment * beamMomentScale + (moment >= 0 ? 15 : -5)}
                  textAnchor="start"
                  fill="white"
                  fontSize="12"
                >
                  {moment.toFixed(1)} kN⋅m
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}
