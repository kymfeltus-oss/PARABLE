export type VisualFilter = {
  id: string;
  name: string;
  cssFilter: string;
  previewClass: string;
};

export const VISUAL_FILTERS: VisualFilter[] = [
  { id: "normal", name: "Normal", cssFilter: "none", previewClass: "" },
  {
    id: "clarendon",
    name: "Clarendon",
    cssFilter: "contrast(1.25) brightness(1.1) saturate(1.25) hue-rotate(-5deg)",
    previewClass: "studio-filter-clarendon",
  },
  {
    id: "lark",
    name: "Lark",
    cssFilter: "brightness(1.1) saturate(1.1) contrast(0.95)",
    previewClass: "studio-filter-lark",
  },
  {
    id: "juno",
    name: "Juno",
    cssFilter: "saturate(1.5) brightness(1.1) sepia(0.15)",
    previewClass: "studio-filter-juno",
  },
  {
    id: "ludwig",
    name: "Ludwig",
    cssFilter: "contrast(1.05) brightness(1.05) saturate(0.85)",
    previewClass: "studio-filter-ludwig",
  },
  {
    id: "moon",
    name: "Moon",
    cssFilter: "grayscale(1) contrast(1.1) brightness(1.1)",
    previewClass: "studio-filter-moon",
  },
];

export function getFilterById(id: string): VisualFilter {
  return VISUAL_FILTERS.find((f) => f.id === id) ?? VISUAL_FILTERS[0];
}
