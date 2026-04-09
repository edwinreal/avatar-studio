import { Types } from "mongoose";
import {
  createIdFactory,
  createScriptRecord,
  db,
  extractScriptTags,
  updateScriptRecord,
  upsertVocabularyFromScript
} from "../data/store.js";
import { mongoStatus } from "../db/mongo.js";
import { ScriptModel } from "../models/script.js";
import { UserModel } from "../models/user.js";
import { VaultModel } from "../models/vault.js";
import { VocabularyModel } from "../models/vocabulary.js";
import type { TagKind, ScriptRecord, UserRecord, VaultRecord, VocabularyRecord } from "../types.js";

const useMongo = () => mongoStatus().connected;

// MongoDB document types
interface MongoScriptTag {
  label: TagKind;
  value: string;
  sceneId: string;
}

interface MongoScriptDoc {
  _id: Types.ObjectId;
  ownerId: string;
  title: string;
  content: string;
  sceneId: string;
  tags: MongoScriptTag[];
  visualPrompts: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface MongoUserDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  syncLevel: number;
  streakDays: number;
  createdAt?: Date;
}

interface MongoVocabularyDoc {
  _id: Types.ObjectId;
  ownerId: string;
  term: string;
  type: TagKind;
  meaning: string;
  sceneId: string;
  scriptId: string;
  assetUrl: string;
  createdAt?: Date;
}

interface MongoVaultDoc {
  _id: Types.ObjectId;
  ownerId: string;
  vocabularyId: string;
  sceneId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  assetType: "image" | "video" | "prompt";
  notes: string;
  createdAt?: Date;
}

const mapScriptDoc = (doc: MongoScriptDoc): ScriptRecord => ({
  id: doc._id.toString(),
  ownerId: doc.ownerId,
  title: doc.title,
  content: doc.content,
  sceneId: doc.sceneId,
  tags: (doc.tags ?? []).map((tag) => ({
    id: `${doc._id.toString()}-${tag.label}-${tag.value}`,
    label: tag.label,
    value: tag.value,
    scriptId: doc._id.toString(),
    sceneId: tag.sceneId,
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString()
  })),
  visualPrompts: doc.visualPrompts ?? [],
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString()
});

const mapUserDoc = (doc: MongoUserDoc): UserRecord => ({
  id: doc._id.toString(),
  name: doc.name,
  email: doc.email,
  syncLevel: doc.syncLevel,
  streakDays: doc.streakDays,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString()
});

const mapVocabularyDoc = (doc: MongoVocabularyDoc): VocabularyRecord => ({
  id: doc._id.toString(),
  ownerId: doc.ownerId,
  term: doc.term,
  type: doc.type,
  meaning: doc.meaning,
  sceneId: doc.sceneId,
  scriptId: doc.scriptId,
  assetUrl: doc.assetUrl,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString()
});

const mapVaultDoc = (doc: MongoVaultDoc): VaultRecord => ({
  id: doc._id.toString(),
  ownerId: doc.ownerId,
  vocabularyId: doc.vocabularyId,
  sceneId: doc.sceneId,
  cloudinaryPublicId: doc.cloudinaryPublicId,
  secureUrl: doc.secureUrl,
  assetType: doc.assetType,
  notes: doc.notes,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString()
});

const syncMongoVocabularyFromScript = async (
  ownerId: string,
  scriptId: string,
  sceneId: string,
  content: string
) => {
  const tags = extractScriptTags(content);
  await VocabularyModel.deleteMany({ ownerId, scriptId });

  if (tags.length === 0) {
    return;
  }

  await VocabularyModel.insertMany(
    tags.map((tag) => ({
      ownerId,
      term: tag.value,
      type: tag.label,
      meaning:
        tag.label === "vocab"
          ? "Learning term extracted from script."
          : "Grammar pattern tracked from the script.",
      sceneId,
      scriptId,
      assetUrl: "cloudinary://synapse-studios/pending-link"
    }))
  );
};

export const scriptsRepository = {
  async findAll(ownerId: string) {
    if (!useMongo()) {
      return db.scripts.filter((entry) => entry.ownerId === ownerId);
    }

    const docs = await ScriptModel.find({ ownerId }).sort({ createdAt: -1 }).lean(false);
    return docs.map(mapScriptDoc);
  },

  async findById(id: string, ownerId: string) {
    if (!useMongo()) {
      return db.scripts.find((entry) => entry.id === id && entry.ownerId === ownerId) ?? null;
    }

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await ScriptModel.findOne({ _id: id, ownerId });
    return doc ? mapScriptDoc(doc) : null;
  },

  async create(input: { ownerId: string; title: string; content: string; sceneId: string }) {
    if (!useMongo()) {
      const script = { ...createScriptRecord(input), ownerId: input.ownerId };
      db.scripts.unshift(script);
      upsertVocabularyFromScript(script);
      db.vocabulary = db.vocabulary.map((entry) =>
        entry.scriptId === script.id ? { ...entry, ownerId: input.ownerId } : entry
      );
      return script;
    }

    const tags = extractScriptTags(input.content).map((tag) => ({
      label: tag.label,
      value: tag.value,
      sceneId: input.sceneId
    }));

    const doc = await ScriptModel.create({
      ...input,
      tags,
      visualPrompts: createScriptRecord(input).visualPrompts
    });

    await syncMongoVocabularyFromScript(
      input.ownerId,
      doc._id.toString(),
      input.sceneId,
      input.content
    );
    return mapScriptDoc(doc);
  },

  async update(
    id: string,
    ownerId: string,
    input: { title?: string; content?: string; sceneId?: string }
  ) {
    if (!useMongo()) {
      const scriptIndex = db.scripts.findIndex(
        (entry) => entry.id === id && entry.ownerId === ownerId
      );
      if (scriptIndex === -1) {
        return null;
      }

      const updated = updateScriptRecord(db.scripts[scriptIndex], input);
      db.scripts[scriptIndex] = updated;
      upsertVocabularyFromScript(updated);
      return updated;
    }

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const current = await ScriptModel.findOne({ _id: id, ownerId });
    if (!current) {
      return null;
    }

    const nextContent = input.content ?? current.content;
    const nextSceneId = input.sceneId ?? current.sceneId;
    const generated = createScriptRecord({
      title: input.title ?? current.title,
      content: nextContent,
      sceneId: nextSceneId
    });

    current.title = input.title ?? current.title;
    current.content = nextContent;
    current.sceneId = nextSceneId;
    current.tags = generated.tags.map((tag) => ({
      label: tag.label,
      value: tag.value,
      sceneId: tag.sceneId
    }));
    current.visualPrompts = generated.visualPrompts;
    await current.save();

    await syncMongoVocabularyFromScript(ownerId, id, nextSceneId, nextContent);
    return mapScriptDoc(current);
  },

  async remove(id: string, ownerId: string) {
    if (!useMongo()) {
      const currentLength = db.scripts.length;
      db.scripts = db.scripts.filter((entry) => !(entry.id === id && entry.ownerId === ownerId));
      db.vocabulary = db.vocabulary.filter(
        (entry) => !(entry.scriptId === id && entry.ownerId === ownerId)
      );
      return db.scripts.length !== currentLength;
    }

    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await ScriptModel.findOneAndDelete({ _id: id, ownerId });
    await VocabularyModel.deleteMany({ ownerId, scriptId: id });
    return Boolean(result);
  }
};

export const usersRepository = {
  async findAll() {
    if (!useMongo()) {
      return db.users;
    }

    const docs = await UserModel.find().sort({ createdAt: -1 }).lean(false);
    return docs.map(mapUserDoc);
  },

  async create(input: { name: string; email: string; syncLevel: number; streakDays: number }) {
    if (!useMongo()) {
      const user = {
        id: createIdFactory("usr"),
        name: input.name,
        email: input.email,
        syncLevel: input.syncLevel,
        streakDays: input.streakDays,
        createdAt: new Date().toISOString()
      };

      db.users.unshift(user);
      return user;
    }

    const doc = await UserModel.create(input);
    return mapUserDoc(doc);
  },

  async update(id: string, input: Record<string, unknown>) {
    if (!useMongo()) {
      const user = db.users.find((entry) => entry.id === id);
      if (!user) {
        return null;
      }

      Object.assign(user, input);
      return user;
    }

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await UserModel.findByIdAndUpdate(id, input, { new: true });
    return doc ? mapUserDoc(doc) : null;
  },

  async remove(id: string) {
    if (!useMongo()) {
      const currentLength = db.users.length;
      db.users = db.users.filter((entry) => entry.id !== id);
      return db.users.length !== currentLength;
    }

    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await UserModel.findByIdAndDelete(id);
    return Boolean(result);
  }
};

export const vocabularyRepository = {
  async findAll(ownerId: string, filters: { type?: string; scriptId?: string }) {
    if (!useMongo()) {
      return db.vocabulary.filter((entry) => {
        const matchesOwner = entry.ownerId === ownerId;
        const matchesType = filters.type ? entry.type === filters.type : true;
        const matchesScript = filters.scriptId ? entry.scriptId === filters.scriptId : true;
        return matchesOwner && matchesType && matchesScript;
      });
    }

    const docs = await VocabularyModel.find({
      ownerId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.scriptId ? { scriptId: filters.scriptId } : {})
    })
      .sort({ createdAt: -1 })
      .lean(false);

    return docs.map(mapVocabularyDoc);
  },

  async create(input: {
    term: string;
    type: TagKind;
    meaning: string;
    sceneId: string;
    scriptId: string;
    assetUrl: string;
    ownerId: string;
  }) {
    if (!useMongo()) {
      const item = {
        id: createIdFactory("voc"),
        ...input,
        createdAt: new Date().toISOString()
      };
      db.vocabulary.unshift(item);
      return item;
    }

    const doc = await VocabularyModel.create(input);
    return mapVocabularyDoc(doc);
  },

  async update(id: string, ownerId: string, input: Record<string, unknown>) {
    if (!useMongo()) {
      const item = db.vocabulary.find((entry) => entry.id === id && entry.ownerId === ownerId);
      if (!item) {
        return null;
      }

      Object.assign(item, input);
      return item;
    }

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await VocabularyModel.findOneAndUpdate({ _id: id, ownerId }, input, { new: true });
    return doc ? mapVocabularyDoc(doc) : null;
  },

  async remove(id: string, ownerId: string) {
    if (!useMongo()) {
      const currentLength = db.vocabulary.length;
      db.vocabulary = db.vocabulary.filter(
        (entry) => !(entry.id === id && entry.ownerId === ownerId)
      );
      return db.vocabulary.length !== currentLength;
    }

    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await VocabularyModel.findOneAndDelete({ _id: id, ownerId });
    return Boolean(result);
  }
};

export const vaultRepository = {
  async findAll(ownerId: string, filters: { sceneId?: string; vocabularyId?: string }) {
    if (!useMongo()) {
      return db.vault.filter((entry) => {
        const matchesOwner = entry.ownerId === ownerId;
        const matchesScene = filters.sceneId ? entry.sceneId === filters.sceneId : true;
        const matchesVocabulary = filters.vocabularyId
          ? entry.vocabularyId === filters.vocabularyId
          : true;
        return matchesOwner && matchesScene && matchesVocabulary;
      });
    }

    const docs = await VaultModel.find({
      ownerId,
      ...(filters.sceneId ? { sceneId: filters.sceneId } : {}),
      ...(filters.vocabularyId ? { vocabularyId: filters.vocabularyId } : {})
    })
      .sort({ createdAt: -1 })
      .lean(false);

    return docs.map(mapVaultDoc);
  },

  async create(input: {
    vocabularyId: string;
    sceneId: string;
    cloudinaryPublicId: string;
    secureUrl?: string;
    assetType: "image" | "video" | "prompt";
    notes: string;
    ownerId: string;
  }) {
    if (!useMongo()) {
      const item = {
        id: createIdFactory("vault"),
        ...input,
        createdAt: new Date().toISOString()
      };
      db.vault.unshift(item);
      return item;
    }

    const doc = await VaultModel.create(input);
    return mapVaultDoc(doc);
  }
};
