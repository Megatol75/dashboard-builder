import { Button } from "./ui/button";
import { BLOCK_TYPES } from "../types/blocks";
import { BLOCK_CONSTRAINTS } from "../types/constraints";

interface BlockTypesContentProps {
  onAddBlock: (type: string) => void;
  onDragStart: (type: string) => void;
}

export function BlockTypesContent({
  onAddBlock,
  onDragStart,
}: BlockTypesContentProps) {
  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    blockType: string,
  ) => {
    const constraints =
      BLOCK_CONSTRAINTS[blockType as keyof typeof BLOCK_CONSTRAINTS];

    // Store block type for drop handling
    e.dataTransfer.setData("text/plain", blockType);

    // Calculate grid cell size including margin
    const gridContainer = document.querySelector(".layout-container");
    const columns = 12;
    const margin = 16;
    const containerPadding = 16;

    // Get actual grid width from DOM
    const totalGridWidth = gridContainer
      ? gridContainer.clientWidth - containerPadding * 2 // Subtract container padding
      : 1200; // Fallback width

    const cellWidth = (totalGridWidth - margin * (columns - 1)) / columns; // Account for margins between cells
    const cellHeight = 100 + margin; // 100px cell + margin

    // Create a drag preview element
    const preview = document.createElement("div");
    preview.className = "drag-preview";
    preview.style.width = `${constraints.defaultW * cellWidth + margin * (constraints.defaultW - 1)}px`;
    preview.style.height = `${constraints.defaultH * cellHeight - margin}px`;
    document.body.appendChild(preview);

    // Hide the default drag image
    e.dataTransfer.setDragImage(new Image(), 0, 0);

    // Update preview position during drag
    const handleDrag = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid positions
      preview.style.left = `${e.clientX}px`;
      preview.style.top = `${e.clientY}px`;
      preview.style.display = "block";
    };

    document.addEventListener("drag", handleDrag);
    e.currentTarget.addEventListener(
      "dragend",
      function () {
        preview.remove();
        document.removeEventListener("drag", handleDrag);
      },
      { once: true },
    );

    // Notify parent of drag start
    onDragStart(blockType);
  };

  return (
    <div className="space-y-2">
      {BLOCK_TYPES.map((blockType) => (
        <Button
          key={blockType.id}
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => onAddBlock(blockType.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, blockType.id)}
        >
          <blockType.icon className="h-4 w-4" />
          {blockType.label}
        </Button>
      ))}
    </div>
  );
}
