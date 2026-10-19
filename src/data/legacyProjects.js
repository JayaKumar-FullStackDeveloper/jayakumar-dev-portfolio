// The original hard-coded projects. Used by the public Projects section only when Firebase
// isn't configured, and by the admin "Import existing projects" action to seed Firestore.
export const LEGACY_PROJECTS = [
  {
    slug: 'why-weds',
    title: 'Why Weds: Wedding Events Arrangements - Web Application Development',
    description: 'A web application for planning and arranging wedding events.',
    thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1726586332/Screenshot_2024-09-17_204814_q98p3p.png',
    platform: 'React, HTML5, JS, Tailwind CSS, Node and Express, MongoDB , AWS',
    link: '/projects/why-weds',
    category: 'web',
  },
  {
    slug: 'thozhil-admin-dashboard',
    title: 'Admin Dashboard: Thozhil Job Portal Admin Module Web Application Development',
    description: 'The admin module of the Thozhil job portal web application.',
    thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1739383422/admin_s3zgya.webp',
    platform: 'React, HTML5, JS, Tailwind CSS, Node and Express, MongoDB',
    link: '/projects/thozhil',
    category: 'dashboard',
  },
  {
    slug: 'laya',
    title: 'Laya: Skin and Hair Care E-Commerce Web Application Development',
    description: 'An e-commerce web application for skin and hair care products.',
    thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1723233527/Screenshot_2024-08-02_201129_uhtpig.png',
    platform: 'React, HTML5, JS, Tailwind CSS, Node and Express, MongoDB',
    link: '/projects/laya',
    category: 'ecommerce',
  },
  {
    slug: 'nalaiya-thiran-plasma-donor',
    title: 'Nalaiya Thiran Project: ICT Academy-IBM: Plasma Donor Application - Cloud web Application Development',
    description: 'A cloud web application for plasma donation, built for the ICT Academy–IBM Nalaiya Thiran programme.',
    thumbnail: 'https://res.cloudinary.com/duurpdqpr/image/upload/v1727089414/Screenshot_2024-09-23_163302_hbwpgf.png',
    platform: 'Python Flask Framework, HTML5, CSS, JS, IBM Db2, Jira, SendGrid',
    link: '/projects/nalaiya-thiran',
    category: 'web',
  },
];

// Category documents use the slug as their ID, so these IDs match the legacy `category` keys.
export const DEFAULT_CATEGORIES = [
  { id: 'web-app', slug: 'web-app', name: 'Web App', projectTypes: ['Design'], active: true, sortOrder: 1 },
  { id: 'mobile-app', slug: 'mobile-app', name: 'Mobile App', projectTypes: ['Design'], active: true, sortOrder: 2 },
  { id: 'websites', slug: 'websites', name: 'Websites', projectTypes: ['Design'], active: true, sortOrder: 3 },
  { id: 'others', slug: 'others', name: 'Others', projectTypes: ['Design'], active: true, sortOrder: 4 },
  { id: 'web', slug: 'web', name: 'Web Apps', projectTypes: ['Development'], active: true, sortOrder: 5 },
  { id: 'ecommerce', slug: 'ecommerce', name: 'E-Commerce', projectTypes: ['Development'], active: true, sortOrder: 6 },
  { id: 'dashboard', slug: 'dashboard', name: 'Dashboards', projectTypes: ['Development'], active: true, sortOrder: 7 },
];
