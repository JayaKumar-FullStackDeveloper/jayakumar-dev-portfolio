import React from "react";
import { FaReact, FaHtml5, FaCss3Alt, FaNodeJs, FaDocker, FaAws, FaJs , FaGitAlt} from "react-icons/fa";
import { SiTailwindcss, SiMongodb, SiExpress, SiFlutter, SiKubernetes, SiMysql } from "react-icons/si";
import { IoLogoFigma } from "react-icons/io5";

const IconCard = ({ Icon }) => {
  return (
    <div className="flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-900 rounded-full transform transition-transform duration-300 hover:scale-110 hover:bg-gray-300 dark:hover:bg-gray-700 z-50">
      <Icon className="text-3xl text-blue-500 z-50 relative" />
    </div>
  );
};

export const IconMarquee = () => {
  const icons = [
    FaReact, SiTailwindcss, FaHtml5, FaCss3Alt, FaJs, FaNodeJs, SiExpress, SiMongodb,SiMysql,
    FaDocker, SiKubernetes, SiFlutter, FaAws,IoLogoFigma,FaGitAlt
  ];

  return (
    <div id="icon-section" className={`transition-opacity z-50 relative duration-1000 py-4`}>
      <div className="grid grid-cols-8 gap-3 w-full items-center justify-center z-50">
        {icons.map((Icon, index) => (
          <IconCard key={index} Icon={Icon} />
        ))}
      </div>
    </div>
  );
};

export default IconMarquee;
