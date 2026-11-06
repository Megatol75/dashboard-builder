export const WIDGET_CONSTRAINTS = {
  "data-table": {
    defaultW: 6, // Default width in grid units
    defaultH: 5, // Default height in grid units
    minW: 3, // Minimum allowed width
    minH: 5, // Minimum allowed height
    maxW: 12, // Maximum allowed width
  },
  "pie-chart": {
    defaultW: 4,
    defaultH: 4,
    minW: 3,
    minH: 3,
    maxW: 8,
  },
  "line-chart": {
    defaultW: 6,
    defaultH: 4,
    minW: 4,
    minH: 3,
    maxW: 12,
  },
  "bar-chart": {
    defaultW: 6,
    defaultH: 4,
    minW: 4,
    minH: 3,
    maxW: 12,
  },
  text: {
    defaultW: 4,
    defaultH: 3,
    minW: 1,
    minH: 2,
    maxW: 12,
  },
} as const;
