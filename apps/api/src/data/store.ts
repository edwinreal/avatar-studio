import type {
  ScriptRecord,
  ScriptTag,
  TagKind,
  UserRecord,
  VocabularyRecord,
  VaultRecord
} from "../types.js";

type ScriptTagMatch = {
  label: TagKind;
  value: string;
};

const createId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const now = () => new Date().toISOString();

export const extractScriptTags = (content: string): ScriptTagMatch[] => {
  const matches = content.matchAll(/<(vocab|grammar)>(.*?)<\/\1>/gsi);

  return Array.from(matches, (match) => ({
    label: match[1].toLowerCase() as TagKind,
    value: match[2].trim()
  })).filter((tag) => tag.value.length > 0);
};

export const buildVisualPrompts = (content: string, tags: ScriptTagMatch[]) => {
  const cleanExcerpt = content
    .replace(/<(vocab|grammar)>/gi, "")
    .replace(/<\/(vocab|grammar)>/gi, "")
    .slice(0, 180);

  if (tags.length === 0) {
    return [
      `Create a cinematic learning scene inspired by: ${cleanExcerpt}`,
      "Highlight the main character, futuristic classroom lighting, and clear educational storytelling."
    ];
  }

  return tags.slice(0, 3).map((tag) => {
    const emphasis =
      tag.label === "vocab"
        ? "Make the target word appear as a glowing holographic keyword."
        : "Emphasize the grammar pattern with floating syntax overlays.";

    return `Scene prompt for "${tag.value}": ${emphasis} Keep a neon cyan and magenta style with 3D animation staging.`;
  });
};

const seedUsers: UserRecord[] = [
  {
    id: "usr_synapse",
    name: "Synapse Pilot",
    email: "pilot@synapsestudios.app",
    syncLevel: 68,
    streakDays: 9,
    createdAt: now()
  }
];

const seedScriptContent =
  "Welcome to the lab. Today we learn <vocab>momentum</vocab> through a chase scene and reinforce <grammar>present simple</grammar> in the narration.";

const seedTags = extractScriptTags(seedScriptContent).map<ScriptTag>((tag) => ({
  id: createId("tag"),
  label: tag.label,
  value: tag.value,
  scriptId: "scr_intro",
  sceneId: "scene_001",
  createdAt: now()
}));

const seedScripts: ScriptRecord[] = [
  {
    id: "scr_intro",
    title: "Neon Rooftop Lesson",
    content: seedScriptContent,
    sceneId: "scene_001",
    tags: seedTags,
    visualPrompts: buildVisualPrompts(seedScriptContent, extractScriptTags(seedScriptContent)),
    createdAt: now(),
    updatedAt: now()
  }
];

const seedVocabulary: VocabularyRecord[] = seedTags.map((tag) => ({
  id: createId("voc"),
  term: tag.value,
  type: tag.label,
  meaning:
    tag.label === "vocab"
      ? "Learning term extracted from script."
      : "Grammar pattern tracked from the script.",
  sceneId: tag.sceneId,
  scriptId: tag.scriptId,
  assetUrl: "cloudinary://synapse-studios/demo-asset",
  createdAt: now()
}));

const seedVault: VaultRecord[] = seedVocabulary.map((entry) => ({
  id: createId("vault"),
  vocabularyId: entry.id,
  sceneId: entry.sceneId,
  cloudinaryPublicId: "synapse-studios/demo-scene",
  secureUrl: "https://res.cloudinary.com/demo/video/upload/sample.jpg",
  assetType: "video",
  notes: `Memory anchor for ${entry.term}`,
  createdAt: now()
}));

export const db = {
  scripts: seedScripts,
  users: seedUsers,
  vocabulary: seedVocabulary,
  vault: seedVault
};

export const upsertVocabularyFromScript = (script: ScriptRecord) => {
  db.vocabulary = db.vocabulary.filter((entry) => entry.scriptId !== script.id);

  const vocabularyEntries = script.tags.map<VocabularyRecord>((tag) => ({
    id: createId("voc"),
    term: tag.value,
    type: tag.label,
    meaning:
      tag.label === "vocab"
        ? "Learning term extracted from script."
        : "Grammar pattern tracked from the script.",
    sceneId: tag.sceneId,
    scriptId: script.id,
    assetUrl: "cloudinary://synapse-studios/pending-link",
    createdAt: now()
  }));

  db.vocabulary.push(...vocabularyEntries);
};

export const createScriptRecord = (input: {
  title: string;
  content: string;
  sceneId: string;
}): ScriptRecord => {
  const extractedTags = extractScriptTags(input.content);
  const scriptId = createId("scr");
  const timestamp = now();
  const tags = extractedTags.map<ScriptTag>((tag) => ({
    id: createId("tag"),
    label: tag.label,
    value: tag.value,
    scriptId,
    sceneId: input.sceneId,
    createdAt: timestamp
  }));

  return {
    id: scriptId,
    title: input.title,
    content: input.content,
    sceneId: input.sceneId,
    tags,
    visualPrompts: buildVisualPrompts(input.content, extractedTags),
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

export const updateScriptRecord = (
  current: ScriptRecord,
  input: Partial<Pick<ScriptRecord, "title" | "content" | "sceneId">>
): ScriptRecord => {
  const nextContent = input.content ?? current.content;
  const nextSceneId = input.sceneId ?? current.sceneId;
  const extractedTags = extractScriptTags(nextContent);
  const timestamp = now();

  const nextTags = extractedTags.map<ScriptTag>((tag) => ({
    id: createId("tag"),
    label: tag.label,
    value: tag.value,
    scriptId: current.id,
    sceneId: nextSceneId,
    createdAt: timestamp
  }));

  return {
    ...current,
    title: input.title ?? current.title,
    content: nextContent,
    sceneId: nextSceneId,
    tags: nextTags,
    visualPrompts: buildVisualPrompts(nextContent, extractedTags),
    updatedAt: timestamp
  };
};

export const createIdFactory = createId;
