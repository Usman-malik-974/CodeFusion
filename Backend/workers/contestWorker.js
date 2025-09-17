const contestQueue = require("../queues/contestQueue");
const {ContestParticipation} = require("../models/index");

contestQueue.process(async (job) => {
  const { participationId } = job.data;
  console.log("⏳ Processing job for participation:", participationId);
  const participation = await ContestParticipation.findById(participationId);
  if (!participation || participation.status==="done") return;
  participation.status = "done";
  participation.endedAt = new Date();
  await participation.save();
  console.log("✅ Contest auto-finished:", participationId);
});
