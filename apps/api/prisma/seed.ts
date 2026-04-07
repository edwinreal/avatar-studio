import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    data: {
      name: "Demo Studio Project",
      description: "Proyecto base para explorar escenas, avatares y poses.",
      visualMood: "Cinematic, warm, expressive",
      scenes: {
        create: [
          {
            name: "Scene 1",
            status: "draft",
            timelineJson: {},
            camera: { fov: 45, position: [0, 1.6, 4] },
            lighting: { key: 1, fill: 0.6 }
          }
        ]
      },
      avatars: {
        create: [
          {
            name: "Luna",
            rigUrl: "s3://placeholder/luna.glb",
            meta: { role: "Hero", ageRange: "Young Adult" },
            style: { direction: "Stylized 3D" }
          }
        ]
      }
    },
    where: { name: "Demo Studio Project" },
    update: {}
  });

  await prisma.job.create({
    data: {
      type: "avatar.generate",
      status: "completed",
      payload: { prompt: "Stylized hero avatar" },
      result: { rigUrl: "s3://placeholder/luna.glb" },
      projectId: project.id,
      progress: 100
    }
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
