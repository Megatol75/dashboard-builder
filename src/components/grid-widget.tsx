import { WidgetLayoutItem, WIDGET_TYPES } from "../types/widgets";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { GripVertical, X } from "lucide-react";
import { PieChart, LineChartComponent, BarChartComponent } from "./ui/charts";
import { TextBlock } from "./ui/text-block";
import { DataTable } from "./ui/data-table";
import { cn } from "../lib/utils";

interface GridWidgetProps {
  layout: WidgetLayoutItem;
  onSelect: (block: WidgetLayoutItem) => void;
  onDelete: (blockId: string) => void;
  selected?: boolean;
}

export function GridWidget({
  layout,
  onSelect,
  onDelete,
  selected = false,
}: GridWidgetProps) {
  const renderBlockContent = (layout: WidgetLayoutItem) => {
    try {
      const data = layout.data ? JSON.parse(layout.data) : undefined;

      switch (layout.type) {
        case "pie-chart":
          return <PieChart data={data} />;
        case "line-chart":
          return <LineChartComponent data={data} />;
        case "bar-chart":
          return <BarChartComponent data={data} />;
        case "text":
          return <TextBlock data={data} />;
        case "data-table":
          return <DataTable data={data} />;
        default:
          return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return (
        <div className="text-destructive">Invalid data format: {message}</div>
      );
    }
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    // Only select if it's a left click
    if (e.button === 0) {
      onSelect(layout);
    }
  };

  return (
    <Card
      className={cn(
        "h-full transition-all",
        selected &&
          "ring-2 ring-foreground/50 ring-offset-background ring-offset-2",
      )}
      onMouseDown={handleBlockClick}
    >
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b drag-handle cursor-move",
          selected ? "bg-secondary text-secondary-foreground" : "bg-muted/50",
        )}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          <span className="text-sm font-medium">
            {layout.title ||
              `${WIDGET_TYPES.find((b) => b.id === layout.type)?.label || "Chart"} ${layout.i}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(layout.i);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 h-[calc(100%-48px)]">
        {renderBlockContent(layout)}
      </div>
    </Card>
  );
}
