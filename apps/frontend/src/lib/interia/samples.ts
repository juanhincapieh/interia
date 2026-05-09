export type SampleId = "bedroom" | "studio" | "living" | "workspace";

export type Sample = {
  id: SampleId;
  label: string;
  thumbUrl: string;
  heroUrl: string;
};

export const SAMPLES: readonly Sample[] = [
  {
    id: "bedroom",
    label: "Bedroom",
    thumbUrl: "/samples/bedroom.jpg",
    heroUrl: "/samples/bedroom-hero.jpg",
  },
  {
    id: "studio",
    label: "Studio",
    thumbUrl: "/samples/studio.jpg",
    heroUrl: "/samples/studio.jpg",
  },
  {
    id: "living",
    label: "Living room",
    thumbUrl: "/samples/living.jpg",
    heroUrl: "/samples/living.jpg",
  },
  {
    id: "workspace",
    label: "Workspace",
    thumbUrl: "/samples/workspace.jpg",
    heroUrl: "/samples/workspace.jpg",
  },
] as const;

export const DEFAULT_SAMPLE_ID: SampleId = "bedroom";
