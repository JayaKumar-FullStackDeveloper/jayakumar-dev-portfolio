import React from 'react'

function Experiance() {
    return (
        <>
            <div class="group relative grid transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 p-4 rounded-lg overflow-hidden">
            <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                <header class="z-10 mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2" aria-label="2024 - Present">2024 - Present</header>
                <div class="z-10 sm:col-span-6">
                    <h3 class="font-medium leading-snug text-slate-200"><div>
                        <a class="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300  group/link text-base" href="https://whyglobalservices.com/" target="_blank" rel="noreferrer noopener" aria-label="UI Engineer Co-op at Apple (opens in a new tab)">
                            <span class="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                            <span>Internship | Why Global Service<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none ml-1 translate-y-px" aria-hidden="true">
                                <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd"></path></svg>
                            </span>
                        </a>
                    </div>
                    </h3>
                    <p class="mt-2 text-base leading-normal text-justify">
                        I actively participated in live projects, gaining valuable hands-on experience in MERN Stack.
                        Through close collaboration with senior developers. My contributions spanned various departments,including UI/UX design and Android Application development.
                        I focused on creating responsive and interactive components to ensure seamless user experiences.
                    </p>
                    <div className="flex flex-wrap pt-3 gap-2">
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">UI/UX</div>
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">JavaScript</div>
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">React</div>
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">Node Js</div>
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">Python</div>
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">MongoDB</div>
                        <div class="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200 ">Flutter</div>

                    </div>
                </div>
            </div>
            <div class="mt-8">
                <a class="inline-flex items-baseline leading-tight hover:text-teal-300 focus-visible:text-teal-300 font-semibold text-slate-200 group/link text-base" href="/resume.pdf" target="_blank" rel="noreferrer noopener" aria-label="View Full Résumé (opens in a new tab)">
                    <span>View Full Resume
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none ml-1 translate-y-px" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd"></path>
                        </svg>
                    </span>
                </a>
            </div>
        </>
    )
}

export default Experiance
