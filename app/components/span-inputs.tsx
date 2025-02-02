"use client";

import {
  Span,
  SupportType,
  LoadType,
  PointLoadDistances,
} from "../types/calculator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOAD_TYPES, LOAD_TYPE_LABELS } from "../utils/loadTypes";

interface SpanInputProps {
  span: Span;
  index: number;
  onChange: (span: Span) => void;
}

export default function SpanInputs({ span, index, onChange }: SpanInputProps) {
  const spanLabel =
    String.fromCharCode(65 + index) + String.fromCharCode(66 + index);

  const updateSpan = (field: keyof Span, value: any) => {
    onChange({ ...span, [field]: value });
  };

  const updatePointLoadDistances = (
    field: keyof PointLoadDistances,
    value: number
  ) => {
    onChange({
      ...span,
      pointLoadDistances: {
        ...span.pointLoadDistances,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold mb-4">Span {spanLabel}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Length <span className="text-chart-3 text-xs">(m)</span>
          </label>
          <Input
            type="number"
            value={span.length}
            onChange={(e) =>
              updateSpan("length", parseFloat(e.target.value) || 0)
            }
            className="bg-secondary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">I</label>
          <Input
            type="number"
            value={span.momentOfInertia}
            onChange={(e) =>
              updateSpan("momentOfInertia", parseFloat(e.target.value) || 0)
            }
            className="bg-secondary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Start Support
          </label>
          <Select
            value={span.startSupport}
            onValueChange={(value: SupportType) =>
              updateSpan("startSupport", value)
            }
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select support type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hinged">Hinged</SelectItem>
              <SelectItem value="roller">Roller</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="none">No Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Support</label>
          <Select
            value={span.endSupport}
            onValueChange={(value: SupportType) =>
              updateSpan("endSupport", value)
            }
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select support type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hinged">Hinged</SelectItem>
              <SelectItem value="roller">Roller</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="none">No Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Load Type</label>
          <Select
            value={span.loadType}
            onValueChange={(value: LoadType) => updateSpan("loadType", value)}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select load type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LOAD_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="border-b">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Load Magnitude {span.loadType === LOAD_TYPES.UDL ? "(w)" : "(P)"}
          </label>
          <Input
            type="number"
            value={span.loadMagnitude}
            onChange={(e) =>
              updateSpan("loadMagnitude", parseFloat(e.target.value) || 0)
            }
            className="bg-secondary"
          />
        </div>

        {span.loadType === LOAD_TYPES.POINT_AT_DISTANCE && (
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Distance from left end (a)
              </label>
              <Input
                type="number"
                value={span.pointLoadDistances?.a || 0}
                onChange={(e) =>
                  updatePointLoadDistances("a", parseFloat(e.target.value) || 0)
                }
                className="bg-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Distance from right end (b)
              </label>
              <Input
                type="number"
                value={span.pointLoadDistances?.b || 0}
                onChange={(e) =>
                  updatePointLoadDistances("b", parseFloat(e.target.value) || 0)
                }
                className="bg-secondary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
