const {ContestParticipation}=require('../models/index');
const mongoose=require('mongoose');

// const getContestLeaderboard = async (contestId) => {
//     const leaderboard = await ContestParticipation.aggregate([
//       { $match: { contestId: new mongoose.Types.ObjectId(contestId) } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },
//       {
//         $lookup: {
//           from: "submissions",
//           let: { uid: "$userId", cid: "$contestId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$userID", "$$uid"] },
//                     { $eq: ["$contestId", "$$cid"] },
//                     { $eq: ["$passed", "$total"] },
//                   ],
//                 },
//               },
//             },
//             { $sort: { submittedAt: 1 } },
//             {
//               $group: {
//                 _id: "$questionID",
//                 firstSolvedAt: { $first: "$submittedAt" },
//               },
//             },
//           ],
//           as: "solved",
//         },
//       },
//       {
//         $addFields: {
//           solvedCount: { $size: "$solved" },
//           lastSolvedAt: { $max: "$solved.firstSolvedAt" },
//         },
//       },
//       {
//         $addFields: {
//           totalTime: {
//             $cond: [
//               { $gt: ["$solvedCount", 0] },
//               { $divide: [{ $subtract: ["$lastSolvedAt", "$startedAt"] }, 1000] },
//               0,
//             ],
//           },
//         },
//       },
  
//       {
//         $project: {
//           userId: "$user._id",
//           name: "$user.fullname",
//           email: "$user.email", 
//           solvedCount: 1,  
//           totalTime: 1,
//         },
//       },
//       { $sort: { solvedCount: -1, totalTime: 1 } },
//     ]); 
//     return leaderboard.map((entry, index) => ({
//         rank: index + 1,
//         ...entry,
//       }));
//   };

const getContestLeaderboard = async (contestId) => {
  const leaderboard = await ContestParticipation.aggregate([
    { $match: { contestId: new mongoose.Types.ObjectId(contestId) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "submissions",
        let: { uid: "$userId", cid: "$contestId" },
        pipeline: [
          { $match: {
              $expr: { $and: [
                { $eq: ["$userID", "$$uid"] },
                { $eq: ["$contestId", "$$cid"] }
              ]}
            }
          },
          { $sort: { submittedAt: 1 } },
          {
            $group: {
              _id: "$questionID",
              maxMarks: { $max: "$obtainedMarks" },
              totalMarksPerQuestion: { $max: "$totalMarks" },
              passedAll: { $max: { $eq: ["$passed", "$total"] } },
              earliestSuccessAt: {
                $min: {
                  $cond: [
                    { $eq: ["$passed", "$total"] },
                    "$submittedAt",
                    null
                  ]
                }
              },
              lastSubmittedAt: { $last: "$submittedAt" }
            }
          }
        ],
        as: "submissions",
      },
    },
    {
      $addFields: {
        obtainedMarks: { $sum: "$submissions.maxMarks" },
        totalMarks: { $sum: "$submissions.totalMarksPerQuestion" },
        solvedCount: { $size: { $filter: { input: "$submissions", as: "s", cond: { $eq: ["$$s.passedAll", true] } } } },
        lastEarliestSuccess: { 
          $max: "$submissions.earliestSuccessAt"
        },
        lastSubmission: { $max: "$submissions.lastSubmittedAt" }
      }
    },
    {
      $addFields: {
        totalTime: {
          $cond: [
            { $gt: ["$solvedCount", 0] },
            { $divide: [{ $subtract: ["$lastEarliestSuccess", "$startedAt"] }, 1000] },
            {
              $cond: [
                { $gt: ["$lastSubmission", null] },
                { $divide: [{ $subtract: ["$lastSubmission", "$startedAt"] }, 1000] },
                0
              ]
            }
          ]
        }
      }
    },
    {
      $project: {
        userId: "$user._id",
        name: "$user.fullname",
        email: "$user.email",
        obtainedMarks: 1,
        totalMarks: 1,
        solvedCount: 1,
        totalTime: 1
      }
    },
    { $sort: { obtainedMarks: -1, solvedCount: -1, totalTime: 1 } }
  ]);

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry
  }));
};



module.exports =getContestLeaderboard;