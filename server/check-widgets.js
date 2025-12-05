
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const widgets = await prisma.widget.findMany();
    console.log(JSON.stringify(widgets, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
