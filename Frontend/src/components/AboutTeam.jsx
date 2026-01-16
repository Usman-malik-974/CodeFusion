import { FaLinkedin, FaInstagram, FaCode } from "react-icons/fa";

const AboutTeam = () => {
  const team = [
    {
      name: "Mohd Usman",
      role: "Fullstack Developer",
      img: "Usman.jpeg",
      bio: "Passionate about crafting seamless web experiences, blending intuitive UI/UX with robust backend solutions. Always eager to learn, collaborate, and transform ideas into impactful digital products.",
      linkedin: "https://www.linkedin.com/in/mohdusman974",
      instagram: "https://www.instagram.com/usman_malik_974/",
      leetcode: "https://leetcode.com/u/Usman_malik_974/",
    },
    {
      name: "Gaurav Sahni",
      role: "Fullstack Developer",
      img: "Gaurav.jpeg",
      bio: "Loves solving complex challenges and building scalable applications. Focused on writing clean code, optimizing performance, and delivering solutions that scale seamlessly in real-world environments.",
      linkedin: "https://www.linkedin.com/in/gauravynr",
      instagram: "https://www.instagram.com/itz_gaurav017/",
      leetcode: "https://leetcode.com/u/gauravynr/",
    },
    {
      name: "Firoj Khan",
      role: "Fullstack Developer",
      img: "Firoj.jpeg",
      bio: "Enjoys building end-to-end solutions using React, Node.js, and modern databases. Strong believer in teamwork and innovation, turning complex requirements into smooth digital experiences.",
      linkedin: "https://www.linkedin.com/in/firojynr",
      instagram: "https://www.instagram.com/firojynr",
      leetcode: "https://leetcode.com/u/firojynr",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-20 px-6">
      <h2 className="text-4xl font-bold text-center text-blue-600 mb-3">
        Meet Our Team
      </h2>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-14">
        We are a passionate group of developers dedicated to building modern,
        scalable, and user-friendly web solutions. Collaboration and innovation
        drive everything we do.
      </p>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {team.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <img
              src={member.img}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md mb-5"
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">
              {member.name}
            </h3>
            <p className="text-blue-500 font-medium mb-4">{member.role}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {member.bio}
            </p>

            {/* Social Links */}
            <div className="flex gap-6 mt-auto">
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="text-blue-600 hover:text-blue-800 text-2xl transition transform hover:scale-125"
              >
                <FaLinkedin />
              </a>
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram Profile"
                className="text-pink-500 hover:text-pink-700 text-2xl transition transform hover:scale-125"
              >
                <FaInstagram />
              </a>
              <a
                href={member.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                title="LeetCode Profile"
                className="text-yellow-500 hover:text-yellow-600 text-2xl transition transform hover:scale-125"
              >
                <FaCode />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutTeam;
