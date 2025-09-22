const contestQueue = require("../queues/contestQueue");
const { ContestParticipation, Contest } = require("../models/index");

contestQueue.process(async (job) => {
  try{
  const { participationId } = job.data;
  console.log("Processing job for participation:", participationId);
  const participation = await ContestParticipation.findById(participationId);
  if (!participation || participation.status === "done") return;
  const contest = await Contest.findById(participation.contestId);
  if (!contest) return;
  const startedAt = new Date(participation.startedAt);
  const now = new Date();
  const currentDurationMs = contest.duration * 60 * 1000; 
  const elapsedMs = now - startedAt;
  if (elapsedMs >= currentDurationMs) {
    participation.status = "done";
    participation.endedAt = now;
    await participation.save();
    console.log("Contest auto-finished:", participationId);
  } else {
    const remainingMs = currentDurationMs - elapsedMs;
    console.log(`Rescheduling job in ${remainingMs / 1000}s`);
    await contestQueue.add(
      { participationId },
      {
        delay: remainingMs,
      }
    );
  }
} catch (error) {
  console.error("Error processing contest job:", error);
  throw error; 
}
});
