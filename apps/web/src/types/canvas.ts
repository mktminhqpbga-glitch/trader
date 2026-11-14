import type { ViewportTransform } from "@vue-flow/core";

export type CanvasNodeType = "text" | "image" | "video";

export interface CanvasNodeData {
  content: string;
  label: string;
  icon: string;
}

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  position: { x: number; y: number };
  data: CanvasNodeData;
  dragHandle?: string;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
}

export interface CanvasState {
  id: string;
  revision: number;
  viewport: ViewportTransform;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProjectMutationResponse {
  ok: true;
  project: ProjectSummary;
}

export interface ProjectResponse {
  ok: true;
  project: ProjectSummary;
  canvas: CanvasState;
}

export interface ProjectListResponse {
  ok: true;
  projects: ProjectSummary[];
}

export interface CanvasResponse {
  ok: true;
  canvas: CanvasState;
}
