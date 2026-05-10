export type MobSlug =
  | "kitchen"
  | "skate"
  | "beach"
  | "gym"
  | "dance"
  | "pet"
  | "art"
  | "outdoors";

export type Mob = {
  slug: MobSlug;
  name: string;
  description: string;
  vibeTags: string[];
  memberCount: number;
  gradientClass: string;
  accentHex: string;
};

export type ValidationDecision = "auto_approve" | "review" | "auto_reject";

export type Validation = {
  isCampaignRelevant: boolean;
  confidence: number;
  primarySignals: string[];
  rejectionReasons: string[];
  brandSafetyFlags: string[];
  decision: ValidationDecision;
};

export type Video = {
  id: string;
  mob: MobSlug;
  caption: string;
  user: { handle: string; name: string };
  durationSec: number;
  uploadedAt: string;
  videoUrl: string;
  thumbnailHint: string; // a small descriptor for the gradient placeholder
  validation: Validation;
  vibeTags: string[];
};

export type ReviewItem = Video & {
  reasonForReview: string;
};
