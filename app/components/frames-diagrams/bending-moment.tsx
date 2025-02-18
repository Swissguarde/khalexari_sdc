import { CalculationResults } from "../../types/frameTypes";

interface FrameBendingMomentDiagramProps {
  results: CalculationResults;
}

export default function FrameBendingMomentDiagram({
  results,
}: FrameBendingMomentDiagramProps) {
  // SVG dimensions and scaling
  const svgHeight = 600;
  const svgWidth = 800;
  const margin = { top: 40, right: 60, bottom: 40, left: 60 };

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
    <div className="flex justify-center items-center space-y-8 mt-8">
      <div className="border-t border-white/20 pt-8 w-full max-w-3xl">
        <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6"
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
      <div className="backdrop-blur-sm p-4 rounded-lg w-full max-w-3xl">
        <svg width={svgWidth} height={svgHeight}>
          {/* Frame centerlines */}
          <line
            x1={leftColumnX}
            y1={svgHeight - margin.bottom}
            x2={leftColumnX}
            y2={beamY}
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={rightColumnX}
            y1={svgHeight - margin.bottom}
            x2={rightColumnX}
            y2={beamY}
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={leftColumnX}
            y1={beamY}
            x2={rightColumnX}
            y2={beamY}
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Column bending moment diagrams */}
          <path
            d={generateColumnPath(0)}
            fill="hsl(200, 70%, 50%, 0.2)"
            stroke="hsl(200, 70%, 50%)"
            strokeWidth="2"
          />
          <path
            d={generateColumnPath(1)}
            fill="hsl(200, 70%, 50%, 0.2)"
            stroke="hsl(200, 70%, 50%)"
            strokeWidth="2"
          />

          {/* Beam bending moment diagram */}
          <path
            d={generateBeamPath()}
            fill="hsl(200, 70%, 50%, 0.2)"
            stroke="hsl(200, 70%, 50%)"
            strokeWidth="2"
          />

          {/* Moment values */}
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
                    fill="white"
                    fontSize="12"
                  >
                    {moment.toFixed(1)} kNm
                  </text>
                );
              })
            )
          )}

          {/* Beam moment values */}
          {results.beamBMSF[0].bendingMoment.map((moment, i) => (
            <text
              key={`beam-moment-${i}`}
              x={leftColumnX + results.beamBMSF[0].x[i] * beamLengthScale + 5}
              y={beamY + moment * beamMomentScale + (moment >= 0 ? 15 : -5)}
              textAnchor="start"
              fill="white"
              fontSize="12"
            >
              {moment.toFixed(1)} kN
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
