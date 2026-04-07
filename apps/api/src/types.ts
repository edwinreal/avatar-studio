export type TagKind = "vocab" | "grammar";

export type ScriptTag = {
  id: string;
  label: TagKind;
  value: string;
  scriptId: string;
  sceneId: string;
  createdAt: string;
};

export type ScriptRecord = {
  id: string;
  ownerId?: string;
  title: string;
  content: string;
  sceneId: string;
  tags: ScriptTag[];
  visualPrompts: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  syncLevel: number;
  streakDays: number;
  createdAt: string;
  passwordHash?: string;
};

export type VocabularyRecord = {
  id: string;
  ownerId?: string;
  term: string;
  type: TagKind;
  meaning: string;
  sceneId: string;
  scriptId: string;
  assetUrl: string;
  createdAt: string;
};

export type VaultRecord = {
  id: string;
  ownerId?: string;
  vocabularyId: string;
  sceneId: string;
  cloudinaryPublicId: string;
  secureUrl?: string;
  assetType: "image" | "video" | "prompt";
  notes: string;
  createdAt: string;
};
