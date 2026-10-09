import "dotenv/config";
import prisma from "../src/lib/prisma";

async function checkCounts() {
  try {
    const users = await prisma.user.count();
    const tasks = await prisma.task.count();
    const taskApps = await prisma.taskApplication.count();
    const conversations = await prisma.conversation.count({ where: { taskId: { not: null } } });
    const messages = await prisma.message.count();
    const ratings = await prisma.rating.count();
    const reports = await prisma.messageReport.count();

    console.log("=== SYNORA TASK-ONLY DATABASE COUNTS ===");
    console.log(`Users: ${users}`);
    console.log(`Tasks: ${tasks}`);
    console.log(`TaskApplications: ${taskApps}`);
    console.log(`TaskConversations: ${conversations}`);
    console.log(`Messages: ${messages}`);
    console.log(`Ratings: ${ratings}`);
    console.log(`MessageReports: ${reports}`);
  } catch (err) {
    console.error("Count query error:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
