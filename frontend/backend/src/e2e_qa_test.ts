import "dotenv/config";
import prisma from "./lib/prisma";
import bcrypt from "bcrypt";

const API_BASE = "http://localhost:5000/api";

async function runE2ETests() {
  console.log("==================================================");
  console.log("STARTING SYNORA E2E FUNCTIONAL VERIFICATION SUITE");
  console.log("==================================================\n");

  let testPassedCount = 0;
  let testFailedCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testPassedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      testFailedCount++;
    }
  }

  try {
    // ---------------------------------------------------------
    // 1. AUTHENTICATION & VALIDATION QA
    // ---------------------------------------------------------
    console.log("--- TEST 1: AUTHENTICATION & VALIDATION ---");

    // 1a. Non-DIU email rejection (e.g. gmail)
    const nonDiuRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@gmail.com", password: "password123" }),
    });
    const nonDiuData = await nonDiuRes.json();
    assert(nonDiuRes.status === 400, "Registration rejects Gmail domain (HTTP 400)");
    assert(
      nonDiuData.message === "Only @diu.edu.bd email addresses are accepted.",
      `Correct error message for Gmail domain: "${nonDiuData.message}"`
    );

    // 1b. Valid DIU email registration
    const ts = Date.now();
    const requesterEmail = `qa_req_${ts}@diu.edu.bd`;
    const workerEmail = `qa_wrk_${ts}@diu.edu.bd`;
    const teamCreatorEmail = `qa_creator_${ts}@diu.edu.bd`;
    const teamApplicantEmail = `qa_app_${ts}@diu.edu.bd`;
    const pwd = "Password123!";

    const regReqRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: requesterEmail, password: pwd }),
    });
    const regReqData = await regReqRes.json();
    assert(regReqRes.status === 201, "Requester registration successful (HTTP 201)");
    const requesterToken = regReqData.token;
    const requesterId = regReqData.userId;

    const regWrkRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: workerEmail, password: pwd }),
    });
    const regWrkData = await regWrkRes.json();
    assert(regWrkRes.status === 201, "Worker registration successful (HTTP 201)");
    const workerToken = regWrkData.token;
    const workerId = regWrkData.userId;

    const regCreatorRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: teamCreatorEmail, password: pwd }),
    });
    const teamCreatorToken = (await regCreatorRes.json()).token;

    const regApplicantRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: teamApplicantEmail, password: pwd }),
    });
    const teamApplicantToken = (await regApplicantRes.json()).token;

    // 1c. Duplicate email rejection
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: requesterEmail, password: pwd }),
    });
    assert(dupRes.status === 400, "Duplicate email registration rejected (HTTP 400)");

    // 1d. Login wrong password vs correct password
    const wrongPwdRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: requesterEmail, password: "wrongpassword" }),
    });
    const wrongPwdData = await wrongPwdRes.json();
    assert(wrongPwdRes.status === 400, "Login wrong password rejected (HTTP 400)");
    assert(wrongPwdData.message === "Invalid DIU email or password.", "Correct invalid credentials message");

    const validLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: requesterEmail, password: pwd }),
    });
    assert(validLoginRes.status === 200, "Login valid credentials successful (HTTP 200)");

    // 1e. Banned User Backend Enforcement
    await prisma.user.update({ where: { id: workerId }, data: { isBanned: true } });
    const bannedReqRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const bannedData = await bannedReqRes.json();
    assert(bannedReqRes.status === 403, "Banned user request rejected by backend middleware (HTTP 403)");
    assert(
      bannedData.message === "Your account has been restricted. Please contact administration.",
      `Correct banned error message: "${bannedData.message}"`
    );
    // Unban worker
    await prisma.user.update({ where: { id: workerId }, data: { isBanned: false } });
    const unbannedReqRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assert(unbannedReqRes.status === 200, "Unbanned user can make requests again (HTTP 200)");

    console.log("\n--- TEST 2: TASK MARKETPLACE & ANONYMITY QA ---");

    // 2a. Create Task
    const createTaskRes = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({
        title: "Database System Design Assignment",
        description: "Need help designing PostgreSQL ER diagram and index optimization.",
        category: "ASSIGNMENT",
        budget: 50,
        requirements: "PostgreSQL & Prisma experience required.",
      }),
    });
    const createTaskData = await createTaskRes.json();
    assert(createTaskRes.status === 201, "Task creation successful (HTTP 201)");
    const taskId = createTaskData.task.id;

    // 2b. Browse Tasks & Verify Anonymity (No public email)
    const browseTasksRes = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const tasksList = await browseTasksRes.json();
    const createdTaskInList = tasksList.find((t: any) => t.id === taskId);
    assert(Boolean(createdTaskInList), "Created task appears in browse tasks list");
    assert(
      createdTaskInList.requesterAlias === `Student #${requesterId}`,
      `Task requester displays anonymous alias: ${createdTaskInList.requesterAlias}`
    );
    assert(createdTaskInList.requester.email === undefined, "Task card does NOT expose requester email");

    // 2c. Apply to Task
    const applyTaskRes = await fetch(`${API_BASE}/tasks/${taskId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ message: "I am experienced with PostgreSQL and indexing." }),
    });
    assert(applyTaskRes.status === 201, "Worker application submitted successfully (HTTP 201)");

    // 2d. Prevent Duplicate Application
    const dupApplyRes = await fetch(`${API_BASE}/tasks/${taskId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ message: "Duplicate attempt" }),
    });
    assert(dupApplyRes.status === 400, "Duplicate task application rejected (HTTP 400)");

    // 2e. Requester Sees Applicants (Anonymous Identity)
    const taskDetailRes = await fetch(`${API_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    const taskDetail = await taskDetailRes.json();
    assert(taskDetail.applications.length === 1, "Requester sees 1 applicant");
    const applicant = taskDetail.applications[0];
    assert(applicant.applicantAlias === `Worker #${workerId}`, `Applicant label is anonymous: ${applicant.applicantAlias}`);
    assert(applicant.applicantEmail === undefined, "Applicant private email is NOT exposed to requester");

    // 2f. Select Worker & Verify Task State Transition (OPEN -> ASSIGNED)
    const selectWorkerRes = await fetch(`${API_BASE}/tasks/${taskId}/select-worker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({ workerId }),
    });
    const selectWorkerData = await selectWorkerRes.json();
    assert(selectWorkerRes.status === 200, "Requester worker selection successful (HTTP 200)");
    const conversationId = selectWorkerData.conversationId;
    assert(Boolean(conversationId), "Task conversation auto-created on worker selection");

    const updatedTaskRes = await fetch(`${API_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    const updatedTask = await updatedTaskRes.json();
    assert(updatedTask.status === "ASSIGNED", `Task status correctly updated to ASSIGNED`);

    // 2g. Task Conversation & Messaging
    const sendMsgRes = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({ content: "Hello! Thank you for accepting. When can we start?" }),
    });
    assert(sendMsgRes.status === 201, "Requester sends message in task conversation (HTTP 201)");

    const getMsgsRes = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const getMsgsData = await getMsgsRes.json();
    assert(getMsgsData.messages.length >= 1, "Worker retrieves task conversation message");

    // 2h. Complete Task & Rating Flow
    await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });

    const rateRes = await fetch(`${API_BASE}/tasks/${taskId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({ score: 5, comment: "Exceeded expectations!" }),
    });
    assert(rateRes.status === 201, "Requester rates worker 5 stars (HTTP 201)");

    const dupRateRes = await fetch(`${API_BASE}/tasks/${taskId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({ score: 5, comment: "Duplicate rate" }),
    });
    assert(dupRateRes.status === 400, "Duplicate rating attempt rejected (HTTP 400)");

    console.log("\n--- TEST 3: TEAM MATCH QA ---");

    // 3a. Create Team Opportunity with all fields
    const createTeamRes = await fetch(`${API_BASE}/team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teamCreatorToken}`,
      },
      body: JSON.stringify({
        title: "DIU Robotics Competition Team 2026",
        category: "CLUB",
        subCategory: "Competition Team",
        description: "Looking for hardware enthusiasts to build autonomous line followers.",
        lookingFor: "Embedded C++ programmer & PCB designer",
        requiredSkills: "C++, Arduino, STM32, EasyEDA",
        peopleNeeded: 3,
        department: "Computer Science and Engineering",
        preferredBatch: "62",
        location: "Daffodil Smart City",
        meetingPreference: "In-Person",
        experienceReq: "Basic microcontroller programming",
      }),
    });
    const createTeamData = await createTeamRes.json();
    assert(createTeamRes.status === 201, "Team Opportunity created successfully (HTTP 201)");
    const teamPostId = createTeamData.post.id;

    // 3b. Search and Discovery Filters
    const searchCategoryRes = await fetch(`${API_BASE}/team?category=CLUB`, {
      headers: { Authorization: `Bearer ${teamApplicantToken}` },
    });
    const categoryResults = await searchCategoryRes.json();
    assert(categoryResults.some((p: any) => p.id === teamPostId), "Search by category CLUB returns post");

    const searchSubCategoryRes = await fetch(`${API_BASE}/team?subCategory=Competition%20Team`, {
      headers: { Authorization: `Bearer ${teamApplicantToken}` },
    });
    const subCategoryResults = await searchSubCategoryRes.json();
    assert(subCategoryResults.some((p: any) => p.id === teamPostId), "Search by subCategory returns post");

    const searchKeywordRes = await fetch(`${API_BASE}/team?search=Robotics`, {
      headers: { Authorization: `Bearer ${teamApplicantToken}` },
    });
    const searchResults = await searchKeywordRes.json();
    assert(searchResults.some((p: any) => p.id === teamPostId), "Search by keyword 'Robotics' returns post");

    // 3c. Professional Identity Verification (Team Match exposes professional info)
    const teamDetailRes = await fetch(`${API_BASE}/team/${teamPostId}`, {
      headers: { Authorization: `Bearer ${teamApplicantToken}` },
    });
    const teamDetail = await teamDetailRes.json();
    assert(teamDetail.authorEmail === teamCreatorEmail, `Team Match reveals author email: ${teamDetail.authorEmail}`);

    // 3d. Apply & Prevent Self/Duplicate Applications
    const selfApplyRes = await fetch(`${API_BASE}/team/${teamPostId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teamCreatorToken}`,
      },
      body: JSON.stringify({ message: "Self application" }),
    });
    assert(selfApplyRes.status === 400, "Self application to own opportunity rejected (HTTP 400)");

    const appApplyRes = await fetch(`${API_BASE}/team/${teamPostId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teamApplicantToken}`,
      },
      body: JSON.stringify({ message: "Hi! I have 2 years experience with C++ and Arduino." }),
    });
    assert(appApplyRes.status === 201, "Team application submitted successfully (HTTP 201)");

    const appDupApplyRes = await fetch(`${API_BASE}/team/${teamPostId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teamApplicantToken}`,
      },
      body: JSON.stringify({ message: "Duplicate" }),
    });
    assert(appDupApplyRes.status === 400, "Duplicate team application rejected (HTTP 400)");

    // 3e. Creator Accept Application & Messaging
    const creatorViewDetailRes = await fetch(`${API_BASE}/team/${teamPostId}`, {
      headers: { Authorization: `Bearer ${teamCreatorToken}` },
    });
    const creatorViewDetail = await creatorViewDetailRes.json();
    assert(creatorViewDetail.applications.length === 1, "Creator sees 1 applicant");
    const teamAppId = creatorViewDetail.applications[0].id;

    const acceptAppRes = await fetch(`${API_BASE}/team/applications/${teamAppId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teamCreatorToken}`,
      },
      body: JSON.stringify({ status: "ACCEPTED" }),
    });
    assert(acceptAppRes.status === 200, "Creator accepts team application (HTTP 200)");

    // 3f. Close Opportunity & Verify Backend Enforcement
    const closeTeamRes = await fetch(`${API_BASE}/team/${teamPostId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teamCreatorToken}`,
      },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    assert(closeTeamRes.status === 200, "Opportunity closed successfully (HTTP 200)");

    const applyClosedRes = await fetch(`${API_BASE}/team/${teamPostId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ message: "Applying to closed post" }),
    });
    const applyClosedData = await applyClosedRes.json();
    assert(applyClosedRes.status === 400, "Backend blocks application to CLOSED opportunity (HTTP 400)");
    assert(
      applyClosedData.message === "This opportunity is no longer open",
      `Correct message on applying to closed: "${applyClosedData.message}"`
    );

    console.log("\n--- TEST 4: ADMIN & FEATURE TOGGLE QA ---");

    // 4a. Non-admin forbidden from admin endpoints
    const nonAdminUsersRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    assert(nonAdminUsersRes.status === 403, "Non-admin forbidden from /api/admin/users (HTTP 403)");

    // 4b. Admin feature toggle test (Disable taskBoardEnabled)
    // First setup admin role on a user
    const adminEmail = `qa_admin_${ts}@diu.edu.bd`;
    const regAdminRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: pwd }),
    });
    const adminData = await regAdminRes.json();
    await prisma.user.update({ where: { id: adminData.userId }, data: { role: "ADMIN" } });

    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: pwd }),
    });
    const adminToken = (await adminLoginRes.json()).token;

    // Toggle Task Marketplace OFF
    await fetch(`${API_BASE}/admin/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ taskBoardEnabled: false, teamMatchEnabled: true }),
    });

    const disabledTaskReqRes = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    const disabledData = await disabledTaskReqRes.json();
    assert(disabledTaskReqRes.status === 403, "Backend returns 403 when Task Marketplace is disabled by Admin");
    assert(
      disabledData.message === "This feature is currently disabled by administration.",
      `Correct disabled feature message: "${disabledData.message}"`
    );

    // Restore Task Marketplace ON
    await fetch(`${API_BASE}/admin/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ taskBoardEnabled: true, teamMatchEnabled: true }),
    });

    const restoredTaskReqRes = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    assert(restoredTaskReqRes.status === 200, "Backend allows task requests when feature is restored (HTTP 200)");

    console.log("\n==================================================");
    console.log(`SUMMARY: ${testPassedCount} PASSED, ${testFailedCount} FAILED`);
    console.log("==================================================\n");

  } catch (err) {
    console.error("E2E Test Suite Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
