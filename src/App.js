import './App.css';
import React, { useEffect, useState } from 'react'

function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  const gradientStyle = {
    background: `radial-gradient(500px at ${position.x}px ${position.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
  };
  return (
      <body className='bg-slate-900 leading-relaxed text-slate-400 antialiased selection:bg-teal-300 selection:text-teal-900 w-screen h-screen'>
        <div className='relative w-full h-full'>

          <div className='absolute inset-0 z-0 transition duration-300' style={gradientStyle}></div>

          <div className='relative z-10 mx-auto max-w-screen-xl px-6 py-12 font-sans md:px-12 md:py-20 lg:px-24 lg:py-0 h-full'>
            <div className="lg:flex lg:justify-between lg:gap-2 h-full">
              <header className="lg:sticky lg:top-0 lg:flex lg:flex-col lg:justify-between lg:py-24 lg:w-5/12 h-full">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
                    <a href="/">Jayakumar</a>
                  </h1>
                  <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">
                    Full Stack Developer
                  </h2>
                  <p className="mt-4 max-w-xs leading-normal">
                    I build pixel-perfect, engaging, and accessible digital experiences.
                  </p>
                  <nav class="nav hidden lg:block" aria-label="In-page jump links">
                    <ul class="mt-16 w-max">
                      <li><a class="group flex items-center py-3 active" href="#about">
                        <span class="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span>
                        <span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">About</span>
                      </a></li>
                      <li><a class="group flex items-center py-3" href="#experience">
                        <span class="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span>
                        <span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">Experience</span>
                      </a></li>
                      <li><a class="group flex items-center py-3 " href="#projects">
                        <span class="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span>
                        <span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">Projects</span>
                      </a></li>
                      <li><a class="group flex items-center py-3 " href="#contact">
                        <span class="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span>
                        <span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">Contact</span>
                      </a></li>
                    </ul>
                  </nav>
                </div>
                <ul className='ml-1 mt-8 flex items-center'>
                  <li className='mr-5 text-xs shrink-0'>
                    <a class="block hover:text-slate-200" href="https://github.com/jayakumar1801" target="_blank" rel="noreferrer noopener" aria-label="GitHub (opens in a new tab)" title="GitHub"><span class="sr-only">GitHub</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-10 w-10" aria-hidden="true">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                    </a>
                  </li>
                  <li class="mr-5 text-xs shrink-0">
                    <a class="block hover:text-slate-200" href="https://www.linkedin.com/in/Jayakumar-FullStackDeveloper/" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn (opens in a new tab)" title="LinkedIn">
                      <span class="sr-only">LinkedIn</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-11 w-11" aria-hidden="true"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                      </svg>
                    </a>
                  </li>

                </ul>
              </header>
              <main className='pt-24 lg:w-7/12 h-full lg:py-24 overflow-y-auto transition duration-300' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div>
                  <section id='about'>
                    <p>
                      Hello! I'm Jayakumar, a dedicated full-stack developer at Why Global Service, passionate about creating intuitive and engaging web applications. At Why Global Service, I work on live projects, focusing on UI, UX, frontend development, and app development. Utilizing technologies such as React, Tailwind CSS, Node.js, and MongoDB, I build responsive and visually appealing web applications. Collaborating with cross-functional teams, I strive to deliver seamless digital solutions.

                      Driven by the challenge of transforming complex ideas into simple, elegant designs, I am committed to continuous learning and growth in the dynamic field of web development. I welcome connections with like-minded professionals and potential collaborators.
                    </p>
                  </section>

                  <p>
                    Hello! I'm Jayakumar, a dedicated full-stack developer at Why Global Service, passionate about creating intuitive and engaging web applications. At Why Global Service, I work on live projects, focusing on UI, UX, frontend development, and app development. Utilizing technologies such as React, Tailwind CSS, Node.js, and MongoDB, I build responsive and visually appealing web applications. Collaborating with cross-functional teams, I strive to deliver seamless digital solutions.

                    Driven by the challenge of transforming complex ideas into simple, elegant designs, I am committed to continuous learning and growth in the dynamic field of web development. I welcome connections with like-minded professionals and potential collaborators.
                  </p>
                  <p>
                    Hello! I'm Jayakumar, a dedicated full-stack developer at Why Global Service, passionate about creating intuitive and engaging web applications. At Why Global Service, I work on live projects, focusing on UI, UX, frontend development, and app development. Utilizing technologies such as React, Tailwind CSS, Node.js, and MongoDB, I build responsive and visually appealing web applications. Collaborating with cross-functional teams, I strive to deliver seamless digital solutions.

                    Driven by the challenge of transforming complex ideas into simple, elegant designs, I am committed to continuous learning and growth in the dynamic field of web development. I welcome connections with like-minded professionals and potential collaborators.
                  </p>
                </div>
              </main>
            </div>
          </div>
        </div>
      </body>
  );
}

export default App;
