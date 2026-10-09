import "dotenv/config";
import prisma from "./lib/prisma";

async function checkCounts() {
  try {
    const users = await prisma.user.count();
    const tasks = await prisma.task.count();
    const taskApps = await prisma.taskApplication.count();
    const teamPosts = await prisma.teamPost.count();
    const teamApps = await prisma.teamApplication.count();
    const conversations = await prisma.conversation.count();
    const messages = await prisma.message.count();
    const ratings = await prisma.rating.count();

    console.log("=== DATABASE COUNTS (BEFORE) ===");
    console.log(`Users: ${users}`);
    console.log(`Tasks: ${tasks}`);
    console.log(`TaskApplications: ${taskApps}`);
    console.log(`TeamPosts: ${teamPosts}`);
    console.log(`TeamApplications: ${teamApps}`);
    console.log(`Conversations: ${conversations}`);
    console.log(`Messages: ${messages}`);
    console.log(`Ratings: ${ratings}`);
  } catch (err) {
    console.error("Count query error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
