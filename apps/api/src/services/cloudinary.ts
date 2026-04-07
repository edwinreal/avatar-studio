import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";

const enabled = Boolean(cloudName && apiKey && apiSecret);

if (enabled) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

export const cloudinaryStatus = () => ({
  enabled
});

export const uploadRemoteAsset = async (input: {
  sourceUrl: string;
  sceneId: string;
  vocabularyId: string;
}) => {
  if (!enabled) {
    return {
      provider: "stub" as const,
      publicId: `stub/${input.sceneId}/${input.vocabularyId}`,
      secureUrl: input.sourceUrl,
      resourceType: "image" as const
    };
  }

  const result = await cloudinary.uploader.upload(input.sourceUrl, {
    folder: `synapse-studios/${input.sceneId}`,
    public_id: input.vocabularyId,
    resource_type: "auto"
  });

  return {
    provider: "cloudinary" as const,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    resourceType:
      result.resource_type === "video" ? ("video" as const) : ("image" as const)
  };
};
