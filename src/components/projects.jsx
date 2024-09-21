import React from 'react';
import { Link } from 'react-router-dom';

function ProjectsPage() {
  const projects = [
    {
      title: 'Why Weds: Wedding Events Arrangements - Web Application Development',
      thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1726586332/Screenshot_2024-09-17_204814_q98p3p.png', 
      platform: 'React, HTML5, JS, Tailwind CSS, Node and Express, MongoDB',
      link: '/projects/why-weds',
    },
    {
      title: 'Laya: Skin and Hair Care E-Commerce Web Application Development',
      thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1723233527/Screenshot_2024-08-02_201129_uhtpig.png', 
      platform: 'React, HTML5, JS, Tailwind CSS, Node and Express, MongoDB',
      link: '/projects/laya',
    },
    {
      title: 'Nalaiya Thiran Project: ICT Academy-IBM: Plasma Donor Application - Cloud web Application Development',
      thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1723233527/Screenshot_2024-08-02_201129_uhtpig.png', 
      platform: 'Python Flask Framework, HTML5, CSS, JS, IBM Db2, Jira, SendGrid',
      link: '/projects/nalaiya-thiran',
    },
  ];

  return (
    <div className="pb-2">
      <ul className="space-y-2">
        {projects.map((project, index) => (
          <li
            key={index}
            className="group relative grid transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 p-4 rounded-lg overflow-hidden"
          >
            <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-600/15 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
            <img
              src={project.thumbnail}
              alt={project.title}
              className="z-10 sm:col-span-3 w-full h-30 object-cover rounded-sm pb-3 lg:pb-0"
            />
            <div className="z-10 sm:col-span-5">
              <h3 className="font-medium leading-snug text-slate-200">
                <div>
                  <Link
                    className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 group/link text-base"
                    to={project.link}
                    aria-label={project.title}
                  >
                    <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 sm:-inset-y-6 lg:block"></span>
                    <span className=''>{project.title}</span>
                  </Link>
                </div>
              </h3>
              <p className="mt-2 sm:mt-4 text-base leading-normal text-justify">
                Platform: {project.platform}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectsPage;
