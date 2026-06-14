import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Prarthana",
      xp: 0,
      goals: "Improve Physics",
    },
  });

  console.log("User created:", user);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
