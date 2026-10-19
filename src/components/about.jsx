import React from 'react'
import ResumeLink from './resumeLink'

function About() {
  return (
    <div className="select-none  sm:z-20 lg:mt-0 mt-4">
      <p className='text-justify lg:text-[15px] text-base font-medium leading-5.5 pb-2 lg:pb-3 pt-1'>
        Hi! I am Jayakumar, a UI/UX Designer passionate about creating intuitive, user-centred digital experiences. I combine creativity, design thinking, and problem-solving to design meaningful products that balance user needs and business goals.
      </p>
      <p className='text-justify lg:text-[15px] text-base font-medium leading-5.5 pb-2 lg:pb-3'>
        I specialize in designing AI-driven platforms, data analytics dashboards, e-commerce applications, and enterprise SaaS products for web and mobile. My focus is on simplifying complex workflows and transforming business requirements into seamless user experiences.
      </p>
      <p className='text-justify lg:text-[15px] text-base font-medium leading-5.5 pb-2 lg:pb-3'>
        My expertise includes UX research, user interviews, usability testing, heuristic evaluation, and workflow analysis. I translate user insights into information architecture, user flows, wireframes, high-fidelity UI designs, and interactive prototypes that improve usability and engagement.
      </p>
      <p className='text-justify lg:text-[15px] text-base font-medium leading-5.5 pb-2 lg:pb-3'>
        I also focus on responsive design, accessibility, inclusive design, and scalable design systems. By creating reusable components and consistent design guidelines, I deliver cohesive digital experiences while collaborating with product managers and developers to improve product quality.
      </p>
      <p className='text-justify lg:text-[15px] text-base font-medium leading-5.5 pb-2 lg:pb-6'>
        With hands-on experience in the MERN stack (MongoDB, Express.js, React.js, and Node.js), I bridge the gap between design and development, ensuring technical feasibility and seamless implementation. I'm excited to discuss how my skills and experiences align with the role, and I look forward to contributing to your team.
      </p>
      <ResumeLink />
    </div>
  )
}

export default About
