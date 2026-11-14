import { useState, useEffect, RefObject } from "react";
import {
  LayoutItem,
  Responsive,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import { Layout, ResponsiveLayouts } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../App.css";
import {
  WidgetLayoutItem,
  WIDGET_TYPES,
  defaultTableData,
} from "../types/widgets";
import { WIDGET_CONSTRAINTS } from "../types/constraints";
import { Sidebar } from "./sidebar";
import { GridPropertiesPanel } from "./grid-properties-panel";
import { GridWidget } from "./grid-widget";
import { WidgetToolBar } from "./widget-toolbar";
import { WidgetProperties } from "../types/widget-properties";

//const ResponsiveGridLayout = WidthProvider(Responsive);

export function GridDashboard() {
  const { width, containerRef, mounted } = useContainerWidth();
  // Grid and layout state
  //const [width, setWidth] = useState(1200); // Width of the grid container
  const [layouts, setLayouts] = useState<{ [key: string]: WidgetLayoutItem[] }>(
    {
      lg: [],
    },
  ); // Responsive layouts
  const [blockCount, setBlockCount] = useState(1); // Counter for generating unique block IDs
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(
    null,
  );

  // Properties panel state
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256); // Width of properties panel
  const [isResizing, setIsResizing] = useState(false); // Whether panel is being resized
  const [isPanelVisible, setIsPanelVisible] = useState(true); // Whether panel is visible

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null); // Currently selected block

  const [widgets, setWidgets] = useState(new Map<string, WidgetProperties>());

  // Update grid width when panel visibility or width changes
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector(".layout-container");
      if (container) {
        //const sidebarWidth = 256; // Width of the sidebar
        //const containerPadding = 32; // Total padding of the container
        // Calculate available width accounting for sidebar and properties panel
        // const availableWidth =
        //   window.innerWidth -
        //   sidebarWidth -
        //   (isPanelVisible ? propertiesPanelWidth : 0);
        // Set width with minimum of 400px and remove the extra padding to prevent horizontal scroll
        //const containerWidth = Math.max(400, availableWidth - containerPadding);
        //setWidth(containerWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isPanelVisible, propertiesPanelWidth]);

  // Handle properties panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate new panel width based on mouse position
        const newWidth = window.innerWidth - e.clientX;
        setPropertiesPanelWidth(Math.max(200, Math.min(600, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Add a new block to the grid
  const addNewWidget = (type: string) => {
    const constraints =
      WIDGET_CONSTRAINTS[type as keyof typeof WIDGET_CONSTRAINTS];
    const currentLayout = layouts[currentBreakpoint] || [];

    // Find first available position
    const occupiedSpaces = new Set<string>();
    currentLayout.forEach((block) => {
      for (let x = block.x; x < block.x + block.w; x++) {
        for (let y = block.y; y < block.y + block.h; y++) {
          occupiedSpaces.add(`${x},${y}`);
        }
      }
    });

    // Find first position that can fit the new block
    let position = { x: 0, y: 0 };
    const cols =
      { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }[currentBreakpoint] || 12;

    // Search row by row until we find a space
    searchLoop: for (let y = 0; y < 1000; y++) {
      // Limit search to prevent infinite loop
      for (let x = 0; x <= cols - constraints.defaultW; x++) {
        // Check if this position can fit the block
        let canFit = true;
        for (let dx = 0; dx < constraints.defaultW; dx++) {
          for (let dy = 0; dy < constraints.defaultH; dy++) {
            if (occupiedSpaces.has(`${x + dx},${y + dy}`)) {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
        }
        if (canFit) {
          position = { x, y };
          break searchLoop;
        }
      }
    }

    const widgetId = `block-${blockCount}`;
    const widgetTitle = `${WIDGET_TYPES.find((b) => b.id === type)?.label || "Chart"} ${blockCount + 1}`;

    // Create new widget with default data
    const newWidget: WidgetLayoutItem = {
      i: widgetId,
      x: position.x,
      y: position.y,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: widgetTitle,
    };

    // Initialize default data based on block type
    let widgetData;

    switch (type) {
      case "pie-chart":
        widgetData = JSON.stringify([
          { name: "A", value: 400, color: "#0088FE" },
          { name: "B", value: 300, color: "#00C49F" },
          { name: "C", value: 200, color: "#FFBB28" },
        ]);
        break;
      case "line-chart":
      case "bar-chart":
        widgetData = JSON.stringify([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 200 },
        ]);
        break;
      case "text":
        widgetData = JSON.stringify({ content: "Enter your text here..." });
        break;
      case "data-table":
        widgetData = JSON.stringify(defaultTableData);
        break;
    }

    newWidget.data = widgetData;

    addWidgetToState(widgetId, {
      id: widgetId,
      type: type,
      title: widgetTitle,
      data: widgetData,
    });

    setLayouts((prev) => ({
      ...prev,
      [currentBreakpoint]: [...currentLayout, newWidget],
    }));
    setBlockCount(blockCount + 1);
  };

  const addWidgetToState = (
    key: string,
    widgetProperties: WidgetProperties,
  ) => {
    setWidgets((prev) => {
      const next = new Map(prev);
      next.set(key, widgetProperties);
      return next;
    });
  };

  const updateWidgetInState = (
    key: string,
    updates: Partial<WidgetProperties>,
  ) => {
    setWidgets((prev) => {
      const next = new Map(prev);
      const widget = next.get(key);
      const updated = { ...widget, ...updates };
      next.set(key, updated as WidgetProperties);
      return next;
    });
  };

  // Update layout when blocks are moved or resized
  const handleLayoutChange = (
    currentLayout: Layout,
    allLayouts: ResponsiveLayouts,
  ) => {
    // Filter out any placeholder items (they have a special 'i' property that starts with '__dropping-elem')
    const filteredLayout = currentLayout.filter(
      (item) => !item.i.startsWith("__dropping-elem"),
    );
    const currentBlocks = layouts[currentBreakpoint] || [];

    const updatedLayout = filteredLayout.map((item) => ({
      ...currentBlocks.find((l) => l.i === item.i),
      ...item,
    }));

    const newArray = { ...allLayouts };
    console.log("New array");
    console.log(newArray);

    console.log(allLayouts);
    console.log(updatedLayout);

    //  setLayouts({
    //    newArray,
    //    [currentBreakpoint]: updatedLayout as WidgetLayoutItem[],
    //  });
  };

  const updateWidgetProperties = (
    widgetId: string,
    updates: Partial<WidgetProperties>,
  ) => {
    updateWidgetInState(widgetId, updates);
  };

  // Delete a widget from the grid
  const deleteBlock = (blockId: string) => {
    setLayouts((prev) => ({
      ...prev,
      [currentBreakpoint]: (prev[currentBreakpoint] || []).filter(
        (l) => l.i !== blockId,
      ),
    }));
    setSelectedWidgetId(null);
  };

  // Handle drag over to update dropping item dimensions
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drag start from sidebar
  const handleDragStart = (widgetType: string) => {
    console.log(widgetType);
    setDraggingBlockType(widgetType);
  };

  // Get dropping item dimensions based on block type
  // const getDroppingItem = (
  //   widgetType: string | null,
  // ): LayoutItem | undefined => {
  //   if (!widgetType) return undefined;
  //   const constraints =
  //     WIDGET_CONSTRAINTS[widgetType as keyof typeof WIDGET_CONSTRAINTS];

  //   return {
  //     i: "__dropping-elem__",
  //     x: 0,
  //     y: 0,
  //     w: constraints.defaultW,
  //     h: constraints.defaultH,
  //   };
  // };

  const handleDragOverGrid = () => {
    const constraints =
      WIDGET_CONSTRAINTS[draggingBlockType as keyof typeof WIDGET_CONSTRAINTS];

    return {
      w: constraints.defaultW,
      h: constraints.defaultH,
      dragOffsetX: 220,
    };
  };

  // Handle drop from outside
  const handleDrop = (_layout: Layout, layoutItem: LayoutItem | undefined) => {
    setDraggingBlockType(null);
    const type = draggingBlockType;
    if (!type || layoutItem === undefined) return;

    const constraints =
      WIDGET_CONSTRAINTS[type as keyof typeof WIDGET_CONSTRAINTS];

    const widgetId = `block-${blockCount}`;
    const widgetTitle = `${WIDGET_TYPES.find((b) => b.id === type)?.label || "Chart"} ${blockCount + 1}`;

    // Create new block at drop position
    const newBlock: WidgetLayoutItem = {
      i: widgetId,
      x: layoutItem.x,
      y: layoutItem.y,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: widgetTitle,
    };

    // Initialize default data based on block type
    let widgetData;

    switch (type) {
      case "pie-chart":
        widgetData = JSON.stringify([
          { name: "A", value: 400, color: "#0088FE" },
          { name: "B", value: 300, color: "#00C49F" },
          { name: "C", value: 200, color: "#FFBB28" },
        ]);
        break;
      case "line-chart":
      case "bar-chart":
        widgetData = JSON.stringify([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 200 },
        ]);
        break;
      case "text":
        widgetData = JSON.stringify({ content: "Enter your text here..." });
        break;
      case "data-table":
        widgetData = JSON.stringify(defaultTableData);
        break;
    }

    newBlock.data = widgetData;

    addWidgetToState(widgetId, {
      id: widgetId,
      type: type,
      title: widgetTitle,
      data: widgetData,
    });

    setLayouts((prev) => ({
      ...prev,
      [currentBreakpoint]: [...(prev[currentBreakpoint] || []), newBlock],
    }));
    setBlockCount(blockCount + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        title="Add Widget"
        isPanelVisible={isPanelVisible}
        onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
      >
        <WidgetToolBar
          onAddWidget={addNewWidget}
          onDragStart={handleDragStart}
        />
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="layout-container flex-1 p-4 overflow-y-auto overflow-x-hidden">
          <div
            ref={containerRef as RefObject<HTMLDivElement>}
            className="bg-muted/30 rounded-lg min-h-full"
            onDragOver={handleDragOver}
          >
            {mounted && (
              <Responsive
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                width={width}
                onLayoutChange={handleLayoutChange}
                onBreakpointChange={setCurrentBreakpoint}
                dropConfig={{
                  enabled: true,
                  onDragOver: handleDragOverGrid,
                }}
                onDrop={handleDrop}
                //isDroppable={true}
                //droppingItem={getDroppingItem(draggingBlockType)}
                //compactType="vertical"
                //preventCollision={false}
                compactor={verticalCompactor}
                resizeConfig={{
                  handles: ["se"],
                }}
                margin={[16, 16]}
                containerPadding={[16, 16]}
                autoSize={true}
              >
                {layouts[currentBreakpoint]?.map((block) => (
                  <div
                    key={block.i}
                    data-grid={{
                      ...block,
                      minW: WIDGET_CONSTRAINTS[
                        block.type as keyof typeof WIDGET_CONSTRAINTS
                      ].minW,
                      minH: WIDGET_CONSTRAINTS[
                        block.type as keyof typeof WIDGET_CONSTRAINTS
                      ].minH,
                      maxW: WIDGET_CONSTRAINTS[
                        block.type as keyof typeof WIDGET_CONSTRAINTS
                      ].maxW,
                    }}
                  >
                    <GridWidget
                      widget={widgets.get(block.i)}
                      onSelect={() => setSelectedWidgetId(block.i)}
                      onDelete={() => deleteBlock(block.i)}
                      selected={selectedWidgetId === block.i}
                    />
                  </div>
                ))}
              </Responsive>
            )}
          </div>
        </div>
      </div>

      {isPanelVisible && (
        <GridPropertiesPanel
          widget={widgets.get(selectedWidgetId ?? "")}
          width={propertiesPanelWidth}
          onResize={(e: React.MouseEvent) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          onUpdateWidget={updateWidgetProperties}
        />
      )}
    </div>
  );
}
