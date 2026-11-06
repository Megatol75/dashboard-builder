import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
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

const ResponsiveGridLayout = WidthProvider(Responsive);

export function GridDashboard() {
  // Grid and layout state
  const [width, setWidth] = useState(1200); // Width of the grid container
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
  const [selectedBlock, setSelectedBlock] = useState<WidgetLayoutItem | null>(
    null,
  ); // Currently selected block
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256); // Width of properties panel
  const [isResizing, setIsResizing] = useState(false); // Whether panel is being resized
  const [isPanelVisible, setIsPanelVisible] = useState(true); // Whether panel is visible

  // Update grid width when panel visibility or width changes
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector(".layout-container");
      if (container) {
        const sidebarWidth = 256; // Width of the sidebar
        const containerPadding = 32; // Total padding of the container
        // Calculate available width accounting for sidebar and properties panel
        const availableWidth =
          window.innerWidth -
          sidebarWidth -
          (isPanelVisible ? propertiesPanelWidth : 0);
        // Set width with minimum of 400px and remove the extra padding to prevent horizontal scroll
        const containerWidth = Math.max(400, availableWidth - containerPadding);

        setWidth(containerWidth);
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
  const addNewBlock = (type: string) => {
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

    // Create new block with default data
    const newBlock: WidgetLayoutItem = {
      i: `block-${blockCount}`,
      x: position.x,
      y: position.y,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: `${WIDGET_TYPES.find((b) => b.id === type)?.label || "Chart"} ${blockCount + 1}`,
    };

    // Initialize default data based on block type
    switch (type) {
      case "pie-chart":
        newBlock.data = JSON.stringify([
          { name: "A", value: 400, color: "#0088FE" },
          { name: "B", value: 300, color: "#00C49F" },
          { name: "C", value: 200, color: "#FFBB28" },
        ]);
        break;
      case "line-chart":
      case "bar-chart":
        newBlock.data = JSON.stringify([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 200 },
        ]);
        break;
      case "text":
        newBlock.data = JSON.stringify({ content: "Enter your text here..." });
        break;
      case "data-table":
        newBlock.data = JSON.stringify(defaultTableData);
        break;
    }

    setLayouts((prev) => ({
      ...prev,
      [currentBreakpoint]: [...currentLayout, newBlock],
    }));
    setBlockCount(blockCount + 1);
  };

  // Update layout when blocks are moved or resized
  const handleLayoutChange = (
    currentLayout: WidgetLayoutItem[],
    allLayouts: { [key: string]: WidgetLayoutItem[] },
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

    setLayouts({
      ...allLayouts,
      [currentBreakpoint]: updatedLayout as WidgetLayoutItem[],
    });
  };

  // Update block properties (title, data, etc.)
  const updateBlockProperties = (
    blockId: string,
    updates: Partial<WidgetLayoutItem>,
  ) => {
    setLayouts((prev) => {
      const currentBlocks = prev[currentBreakpoint] || [];
      const updatedBlocks = currentBlocks.map((block) => {
        if (block.i === blockId) {
          const updatedBlock = { ...block, ...updates };
          if (selectedBlock?.i === blockId) {
            setSelectedBlock(updatedBlock);
          }
          return updatedBlock;
        }
        return block;
      });

      return {
        ...prev,
        [currentBreakpoint]: updatedBlocks,
      };
    });
  };

  // Delete a block from the grid
  const deleteBlock = (blockId: string) => {
    setLayouts((prev) => ({
      ...prev,
      [currentBreakpoint]: (prev[currentBreakpoint] || []).filter(
        (l) => l.i !== blockId,
      ),
    }));
    setSelectedBlock(null);
  };

  // Handle drag over to update dropping item dimensions
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drag start from sidebar
  const handleDragStart = (blockType: string) => {
    setDraggingBlockType(blockType);
  };

  // Get dropping item dimensions based on block type
  const getDroppingItem = (blockType: string | null) => {
    if (!blockType) return undefined;
    const constraints =
      WIDGET_CONSTRAINTS[blockType as keyof typeof WIDGET_CONSTRAINTS];
    return {
      i: "__dropping-elem__",
      w: constraints.defaultW,
      h: constraints.defaultH,
    };
  };

  // Handle drop from outside
  const handleDrop = (
    _layout: WidgetLayoutItem[],
    layoutItem: WidgetLayoutItem,
  ) => {
    const type = draggingBlockType;
    setDraggingBlockType(null);
    if (!type) return;

    const constraints =
      WIDGET_CONSTRAINTS[type as keyof typeof WIDGET_CONSTRAINTS];

    // Create new block at drop position
    const newBlock: WidgetLayoutItem = {
      i: `block-${blockCount}`,
      x: layoutItem.x,
      y: layoutItem.y,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: `${WIDGET_TYPES.find((b) => b.id === type)?.label || "Chart"} ${blockCount + 1}`,
    };

    // Initialize default data based on block type
    switch (type) {
      case "pie-chart":
        newBlock.data = JSON.stringify([
          { name: "A", value: 400, color: "#0088FE" },
          { name: "B", value: 300, color: "#00C49F" },
          { name: "C", value: 200, color: "#FFBB28" },
        ]);
        break;
      case "line-chart":
      case "bar-chart":
        newBlock.data = JSON.stringify([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 200 },
        ]);
        break;
      case "text":
        newBlock.data = JSON.stringify({ content: "Enter your text here..." });
        break;
      case "data-table":
        newBlock.data = JSON.stringify(defaultTableData);
        break;
    }

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
        <WidgetToolBar onDragStart={handleDragStart} onAddBlock={addNewBlock} />
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="layout-container flex-1 p-4 overflow-y-auto overflow-x-hidden">
          <div
            className="bg-muted/30 rounded-lg min-h-full"
            onDragOver={handleDragOver}
          >
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              width={width}
              onLayoutChange={handleLayoutChange}
              onBreakpointChange={setCurrentBreakpoint}
              onDrop={handleDrop}
              isDroppable={true}
              droppingItem={getDroppingItem(draggingBlockType)}
              compactType="vertical"
              preventCollision={false}
              resizeHandles={["se"]}
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
                    layout={block}
                    onSelect={() => setSelectedBlock(block)}
                    onDelete={() => deleteBlock(block.i)}
                    selected={selectedBlock?.i === block.i}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </div>
      </div>

      {isPanelVisible && (
        <GridPropertiesPanel
          selectedWidget={selectedBlock}
          width={propertiesPanelWidth}
          onResize={(e: React.MouseEvent) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          onUpdateBlock={updateBlockProperties}
        />
      )}
    </div>
  );
}
