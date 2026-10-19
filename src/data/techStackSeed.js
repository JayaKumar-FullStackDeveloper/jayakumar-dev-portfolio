// Starter content for the Tech Stack & Skills section. This is seed data only: it is copied
// into Firestore once (see seedTechStack) and is then managed from the admin panel.
// It is also shown as the offline fallback when Firebase isn't configured.
// Skills with no suitable logo glyph use icon '' (monogram tile); set a logo URL in the admin.

export const TECH_STACK_SEED = [
  {
    slug: 'development',
    name: 'Development',
    icon: 'code',
    skills: [
      ['React.js', 'react'], ['Next.js', 'nextjs'], ['Node.js', 'nodejs'], ['Express.js', 'express'],
      ['JavaScript', 'javascript'], ['TypeScript', 'typescript'], ['HTML5', 'html5'], ['CSS3', 'css3'],
      ['Tailwind CSS', 'tailwind'], ['MongoDB', 'mongodb'], ['MySQL', 'mysql'],
    ],
  },
  {
    slug: 'ai-design',
    name: 'AI Design',
    icon: 'ai',
    skills: [
      ['ChatGPT', 'openai'], ['Claude', 'claude'], ['OpenAI Codex', 'openai'], ['Gemini', 'gemini'],
      ['UX Pilot', ''], ['Magic Patterns', ''], ['GitHub Copilot', 'copilot'],
      ['Figma', 'figma'], ['Framer', 'framer'],
    ],
  },
  {
    slug: 'tools',
    name: 'Tools',
    icon: 'tools',
    skills: [
      ['Adobe Photoshop', 'photoshop'], ['Illustrator', 'illustrator'], ['Adobe XD', 'xd'],
      ['After Effects', 'after-effects'], ['Premiere Pro', 'premiere-pro'], ['Lightroom', 'lightroom'],
      ['Git', 'git'], ['GitHub', 'github'], ['Docker', 'docker'], ['AWS', 'aws'],
      ['VS Code', 'vscode'], ['Postman', 'postman'],
    ],
  },
];
