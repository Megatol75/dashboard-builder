import { WidgetLayoutItem, WIDGET_TYPES } from "../types/widgets";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ChartDataForm } from "./ui/chart-data-form";
import { DataTableForm } from "./ui/data-table-form";

interface GridPropertiesPanelProps {
  selectedWidget: WidgetLayoutItem | null;
  width: number;
  onResize: (e: React.MouseEvent) => void;
  onUpdateBlock: (blockId: string, updates: Partial<WidgetLayoutItem>) => void;
}

export function GridPropertiesPanel({
  selectedWidget,
  width,
  onResize,
  onUpdateBlock,
}: GridPropertiesPanelProps) {
  const renderPropertiesContent = () => {
    if (!selectedWidget) return null;

    const data = selectedWidget.data ? JSON.parse(selectedWidget.data) : null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={selectedWidget.title || ""}
            onChange={(e) =>
              onUpdateBlock(selectedWidget.i, { title: e.target.value })
            }
          />
        </div>

        {selectedWidget.type === "text" && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={data?.content || ""}
              onChange={(e) =>
                onUpdateBlock(selectedWidget.i, {
                  data: JSON.stringify({ content: e.target.value }),
                })
              }
            />
          </div>
        )}

        {(selectedWidget.type === "pie-chart" ||
          selectedWidget.type === "line-chart" ||
          selectedWidget.type === "bar-chart") && (
          <div className="space-y-2">
            <Label>Chart Data</Label>
            <ChartDataForm
              data={data || []}
              onChange={(newData) =>
                onUpdateBlock(selectedWidget.i, {
                  data: JSON.stringify(newData),
                })
              }
              showColorPicker={selectedWidget.type === "pie-chart"}
            />
          </div>
        )}

        {selectedWidget.type === "data-table" && (
          <div className="space-y-2">
            <Label>Table Data</Label>
            <DataTableForm
              data={data || []}
              onChange={(newData) =>
                onUpdateBlock(selectedWidget.i, {
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
        {selectedWidget ? (
          <div className="space-y-2">
            <div className="rounded-md border bg-card text-card-foreground p-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="text-sm text-muted-foreground">
                  {
                    WIDGET_TYPES.find((b) => b.id === selectedWidget.type)
                      ?.label
                  }
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
