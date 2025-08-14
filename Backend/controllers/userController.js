const { User, Batch } = require("../models/index");
const isAdmin = require("../utils/isAdmin");
const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const sendWelcomeMail = require("../utils/sendMail");
const generatePassword = require("../utils/generatePassword");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getAllUsers = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }

    const users = await User.find(
      {},
      "_id fullname email role rollno course session"
    );

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        role: user.role,
        rollno: user.rollno,
        course: user.course,
        session: user.session,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select("_id fullname email role course rollno session");
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = {
      id: updatedUser._id,
      name: updatedUser.fullname,
      email: updatedUser.email,
      role: updatedUser.role,
      course: updatedUser.course,
      rollno: updatedUser.rollno,
      session: updatedUser.session,
    };
    res
      .status(200)
      .json({ message: "User updated successfully", updatedUser: user });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      const field = Object.keys(err.errors)[0];
      const errorMessage = err.errors[field].message;
      return res.status(400).json({ error: errorMessage });
    }
    res.status(500).json({ error: "Internal Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    await Batch.updateMany({ users: id }, { $pull: { users: id } });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Server error while deleting user" });
  }
};

// const searchUsers = async (req, res) => {
//   try {
//     if (!(await isAdmin(req.user.id))) {
//       return res.status(403).json({ error: "Unauthorized Access." });
//     }
//     const { query,by } = req.body;

//     let users;

//     if (query) {
//       const searchRegex = new RegExp(query, "i");

//       users = await User.find(
//         {
//           $or: [
//             { fullname: { $regex: searchRegex } },
//             { email: { $regex: searchRegex } },
//           ],
//         },
//         "_id fullname email role course session rollno"
//       );
//     } else {
//       users = await User.find(
//         {},
//         "_id fullname email role course rollno session"
//       );
//     }

//     res.status(200).json({
//       users: users.map((user) => ({
//         id: user._id,
//         name: user.fullname,
//         email: user.email,
//         role: user.role,
//         course: user.course,
//         rollno: user.rollno,
//         session: user.session,
//       })),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const searchUsers = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }

    const { query, by } = req.body;

    let users = [];

    if (query) {
      const searchRegex = new RegExp(query, "i");
      const searchBy = by === "name" ? "fullname" : by;
      const allowedFields = [
        "fullname",
        "email",
        "rollno",
        "course",
        "session",
        "role",
      ];
      if (searchBy && allowedFields.includes(searchBy)) {
        users = await User.find(
          { [searchBy]: { $regex: searchRegex } },
          "_id fullname email role course session rollno"
        );
      } else {
        users = [];
      }
    } else {
      users = await User.find(
        {},
        "_id fullname email role course rollno session"
      );
    }

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        role: user.role,
        course: user.course,
        rollno: user.rollno,
        session: user.session,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const uploadUsers = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const validUsers = [];
    const failedUsers = [];

    const existingUsers = await User.find({}, "email");
    const existingEmails = new Set(existingUsers.map((u) => u.email));
    const emailsInFile = new Set();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const errors = [];

      const fullname = row.fullname?.toString().trim() || "";
      const email = row.email?.toString().trim().toLowerCase() || "";
      let password = generatePassword(); // Always generate internally
      const role = row.role?.toString().trim().toLowerCase() || "";

      // New fields
      const rollno = row.rollno ? Number(row.rollno) : null;
      const course = row.course?.toString().trim().toUpperCase() || "";
      const session = row.session?.toString().trim() || "";

      // ===== Validations =====
      if (!fullname) errors.push("fullname is empty");
      else if (!/^[A-Za-z ]{2,50}$/.test(fullname))
        errors.push("fullname must be 2-50 characters and letters/spaces only");

      if (!email) errors.push("email is empty");
      else if (!emailRegex.test(email)) errors.push("invalid email format");
      else if (existingEmails.has(email)) errors.push("email already exists");
      else if (emailsInFile.has(email)) errors.push("duplicate in Excel file");

      if (!role) errors.push("role is empty");
      else if (!["user", "admin"].includes(role))
        errors.push("role must be either 'user' or 'admin'");

      // Validate extra fields if role === 'user'
      if (role === "user") {
        if (!rollno || isNaN(rollno))
          errors.push("rollno is required for user");
        if (!course || !["BCA", "MCA"].includes(course))
          errors.push("course must be BCA or MCA for user");
        if (!session) errors.push("session is required for user");
      }

      // ===== Push to failure or valid list =====
      if (errors.length > 0) {
        failedUsers.push({
          fullname,
          email,
          role,
          rollno,
          course,
          session,
          error: errors.join("; "),
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        validUsers.push({
          fullname,
          email,
          password: hashedPassword,
          role,
          rollno,
          course,
          session,
        });

        // Send welcome email with original generated password
        sendWelcomeMail({ to: email, fullname, email, password });

        existingEmails.add(email);
        emailsInFile.add(email);
      }
    }

    // Insert valid users
    if (validUsers.length > 0) {
      await User.insertMany(validUsers);
    }

    // If any failed, send back Excel sheet (without password or batches)
    if (failedUsers.length > 0) {
      const failedWB = xlsx.utils.book_new();
      const failedSheet = xlsx.utils.json_to_sheet(failedUsers);
      xlsx.utils.book_append_sheet(failedWB, failedSheet, "Failed");

      const buffer = xlsx.write(failedWB, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="failed-users.xlsx"`,
        "X-Inserted-Count": validUsers.length,
        "X-Failed-Count": failedUsers.length,
        "Access-Control-Expose-Headers": "X-Inserted-Count, X-Failed-Count",
      });

      return res.status(400).send(buffer);
    }

    return res.status(200).json({
      message: "All users inserted successfully",
      inserted: validUsers.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserBatches = async (req, res) => {
  try {
    const userId = req.user.id;
    if (await isAdmin(req.user.id)) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const user = await User.findById(userId).populate("batches");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      batches: user.batches.map((batch) => ({
        id: batch._id,
        name: batch.name,
        questionCount: batch.assignedQuestions.length,
      })),
    });
  } catch (error) {
    console.error("Error fetching user batches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  uploadUsers,
  getAllUsers,
  updateUser,
  deleteUser,
  searchUsers,
  getUserBatches,
};
