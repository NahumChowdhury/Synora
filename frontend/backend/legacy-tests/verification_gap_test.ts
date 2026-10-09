import "dotenv/config";
import prisma from "./lib/prisma";

const API_BASE = "http://localhost:5000/api";

async function runGapVerification() {
  console.log("==================================================");
  console.log("STARTING SPECIFIC EVIDENCE GAP VERIFICATION SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    const ts = Date.now();
    const pwd = "Password123!";

    // Create test accounts
    const reqEmail = `gap_req_${ts}@diu.edu.bd`;
    const wrkEmail = `gap_wrk_${ts}@diu.edu.bd`;
    const creatorEmail = `gap_creator_${ts}@diu.edu.bd`;
    const appEmail = `gap_app_${ts}@diu.edu.bd`;

    const r1 = await (await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: reqEmail, password: pwd }),
    })).json();

    const r2 = await (await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: wrkEmail, password: pwd }),
    })).json();

    const r3 = await (await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: creatorEmail, password: pwd }),
    })).json();

    const r4 = await (await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: appEmail, password: pwd }),
    })).json();

    const reqToken = r1.token;
    const reqId = r1.userId;
    const wrkToken = r2.token;
    const wrkId = r2.userId;
    const creatorToken = r3.token;
    const appToken = r4.token;

    // ---------------------------------------------------------
    // GAP 1: FULL TASK LIFECYCLE (OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED)
    // ---------------------------------------------------------
    console.log("--- GAP 1: TASK LIFECYCLE (OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED) ---");

    // Step 1: OPEN
    const createRes = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({
        title: "E2E Lifecycle Verification Task",
        description: "Testing state transition from OPEN to COMPLETED.",
        category: "CODING",
        budget: 100,
      }),
    });
    const createData = await createRes.json();
    const taskId = createData.task.id;

    let dbTask = await prisma.task.findUnique({ where: { id: taskId } });
    assert(dbTask?.status === "OPEN", "Initial DB status is OPEN");

    // Apply & Select Worker -> ASSIGNED
    await fetch(`${API_BASE}/tasks/${taskId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wrkToken}`,
      },
      body: JSON.stringify({ message: "Applying to lifecycle task" }),
    });

    await fetch(`${API_BASE}/tasks/${taskId}/select-worker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ workerId: wrkId }),
    });

    dbTask = await prisma.task.findUnique({ where: { id: taskId } });
    assert(dbTask?.status === "ASSIGNED", "DB status updated to ASSIGNED");

    // Update to IN_PROGRESS
    const inProgRes = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    assert(inProgRes.status === 200, "Authorized PATCH status to IN_PROGRESS returned HTTP 200");
    dbTask = await prisma.task.findUnique({ where: { id: taskId } });
    assert(dbTask?.status === "IN_PROGRESS", "DB status successfully verified as IN_PROGRESS");

    // Update to COMPLETED
    const compRes = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    assert(compRes.status === 200, "Authorized PATCH status to COMPLETED returned HTTP 200");
    dbTask = await prisma.task.findUnique({ where: { id: taskId } });
    assert(dbTask?.status === "COMPLETED", "DB status successfully verified as COMPLETED");

    // ---------------------------------------------------------
    // GAP 2: TEAM MATCH REJECTION (PENDING -> REJECTED)
    // ---------------------------------------------------------
    console.log("\n--- GAP 2: TEAM MATCH REJECTION (PENDING -> REJECTED) ---");

    const teamPostRes = await fetch(`${API_BASE}/team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        title: "Rejection Workflow Test Opportunity",
        description: "Testing rejection flow persistence.",
        category: "ACADEMIC",
      }),
    });
    const teamPostData = await teamPostRes.json();
    const teamPostId = teamPostData.post.id;

    // Apply (PENDING)
    await fetch(`${API_BASE}/team/${teamPostId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appToken}`,
      },
      body: JSON.stringify({ message: "Interested applicant" }),
    });

    let dbTeamApp = await prisma.teamApplication.findFirst({ where: { teamPostId } });
    assert(dbTeamApp?.status === "PENDING", "Initial TeamApplication DB status is PENDING");

    // Reject Application (REJECTED)
    const rejectRes = await fetch(`${API_BASE}/team/applications/${dbTeamApp!.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    assert(rejectRes.status === 200, "Creator PATCH application to REJECTED returned HTTP 200");

    dbTeamApp = await prisma.teamApplication.findUnique({ where: { id: dbTeamApp!.id } });
    assert(dbTeamApp?.status === "REJECTED", "TeamApplication DB status verified as REJECTED");

    // Verify applicant API view shows REJECTED status
    const appViewRes = await fetch(`${API_BASE}/team/${teamPostId}`, {
      headers: { Authorization: `Bearer ${appToken}` },
    });
    const appViewData = await appViewRes.json();
    assert(appViewData.myApplicationStatus === "REJECTED", "Applicant API query confirms myApplicationStatus === REJECTED");

    // Verify no conversation was created for REJECTED application
    const convCount = await prisma.conversation.count({
      where: {
        OR: [
          { user1Id: dbTeamApp!.applicantId },
          { user2Id: dbTeamApp!.applicantId },
        ],
        taskId: null,
      },
    });
    assert(convCount === 0, "No direct chat conversation created for REJECTED team application");

    // ---------------------------------------------------------
    // GAP 3: 1-DAY RATING TIMING RULE ENFORCEMENT
    // ---------------------------------------------------------
    console.log("\n--- GAP 3: 1-DAY RATING TIMING RULE ENFORCEMENT ---");

    // 3a. Valid Rating within 24h of completion
    const validRateRes = await fetch(`${API_BASE}/tasks/${taskId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ score: 5, comment: "Submitted right after completion!" }),
    });
    assert(validRateRes.status === 201, "Rating submitted within 24 hours of task completion succeeds (HTTP 201)");

    // 3b. Simulate Expired Task (> 24h ago)
    const expiredTaskRes = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({
        title: "Expired Task Test",
        description: "Task completed 25 hours ago",
        category: "OTHER",
      }),
    });
    const expTaskId = (await expiredTaskRes.json()).task.id;

    await fetch(`${API_BASE}/tasks/${expTaskId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wrkToken}`,
      },
      body: JSON.stringify({ message: "Worker applying" }),
    });

    await fetch(`${API_BASE}/tasks/${expTaskId}/select-worker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ workerId: wrkId }),
    });

    await fetch(`${API_BASE}/tasks/${expTaskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });

    // Artificially update task updatedAt in DB to 25 hours ago
    const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await prisma.task.update({
      where: { id: expTaskId },
      data: { updatedAt: pastDate },
    });

    // Attempt rating on expired task
    const expiredRateRes = await fetch(`${API_BASE}/tasks/${expTaskId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqToken}`,
      },
      body: JSON.stringify({ score: 5, comment: "Late rating attempt" }),
    });
    const expiredRateData = await expiredRateRes.json();
    assert(expiredRateRes.status === 400, "Rating attempt past 24-hour window rejected (HTTP 400)");
    assert(
      expiredRateData.message === "The 1-day rating window for this completed task has expired.",
      `Correct message for expired rating window: "${expiredRateData.message}"`
    );

    console.log("\n==================================================");
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");

  } catch (err) {
    console.error("Gap Verification Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runGapVerification();
