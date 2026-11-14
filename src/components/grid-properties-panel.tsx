import { WIDGET_TYPES } from "../types/widgets";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ChartDataForm } from "./ui/chart-data-form";
import { DataTableForm } from "./ui/data-table-form";
import { WidgetProperties } from "../types/widget-properties";

interface GridPropertiesPanelProps {
  widget: WidgetProperties | undefined;
  width: number;
  onResize: (e: React.MouseEvent) => void;
  onUpdateWidget: (
    widgetId: string,
    updates: Partial<WidgetProperties>,
  ) => void;
}

export function GridPropertiesPanel({
  widget,
  width,
  onResize,
  onUpdateWidget,
}: GridPropertiesPanelProps) {
  const renderPropertiesContent = () => {
    if (widget === undefined) return null;

    const data = widget.data ? JSON.parse(widget.data) : null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={widget.title || ""}
            onChange={(e) => {
              onUpdateWidget(widget.id, { title: e.target.value });
            }}
          />
        </div>

        {widget.type === "text" && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={data?.content || ""}
              onChange={(e) =>
                onUpdateWidget(widget.id, {
                  data: JSON.stringify({ content: e.target.value }),
                })
              }
            />
          </div>
        )}

        {(widget.type === "pie-chart" ||
          widget.type === "line-chart" ||
          widget.type === "bar-chart") && (
          <div className="space-y-2">
            <Label>Chart Data</Label>
            <ChartDataForm
              data={data || []}
              onChange={(newData) =>
                onUpdateWidget(widget.id, {
                  data: JSON.stringify(newData),
                })
              }
              showColorPicker={widget.type === "pie-chart"}
            />
          </div>
        )}

        {widget.type === "data-table" && (
          <div className="space-y-2">
            <Label>Table Data</Label>
            <DataTableForm
              data={data || []}
              onChange={(newData) =>
                onUpdateWidget(widget.id, {
                  data: JSON.stringify(newData),
                })
              }
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-muted/30 flex" style={{ width }}>
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent"
        onMouseDown={onResize}
      />
      <div className="flex-1 p-4 border-l">
        <h2 className="mb-4 font-semibold">Properties</h2>
        {widget ? (
          <div className="space-y-2">
            <div className="rounded-md border bg-card text-card-foreground p-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="text-sm text-muted-foreground">
                  {WIDGET_TYPES.find((b) => b.id === widget.type)?.label}
                </div>
              </div>
            </div>
            {renderPropertiesContent()}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a widget to edit its properties
          </div>
        )}
      </div>
    </div>
  );
}
