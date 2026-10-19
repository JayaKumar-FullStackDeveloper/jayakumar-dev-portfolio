import React, { useState } from 'react';
import './techIcon.css';
import CLOUD_LOGOS from '../data/techLogoAssets.json';
import {
  FaCode, FaCog, FaCss3Alt, FaHtml5, FaJsSquare, FaLayerGroup, FaNodeJs, FaReact, FaTools,
} from 'react-icons/fa';
import { BsOpenai, BsStars } from 'react-icons/bs';
import { VscVscode } from 'react-icons/vsc';
import {
  SiClaude, SiDocker, SiExpress, SiFirebase, SiFramer, SiGit, SiGithub, SiGithubcopilot,
  SiGooglegemini, SiJenkins, SiKubernetes, SiLinux, SiMongodb, SiMysql, SiNetlify, SiNextdotjs,
  SiPostman, SiTailwindcss, SiTypescript, SiVercel,
} from 'react-icons/si';

// Icon registry for the Tech Stack section. Every skill logo has two versions:
//   rest     monochrome white (how the section looks normally)
//   original the real brand look, shown on hover
// Both versions of every built-in logo are files in Cloudinary (PortFolio/tech-stack/default and
// /hover, uploaded by `npm run upload:logos`, URLs in src/data/techLogoAssets.json); the site
// loads those and falls back to drawing the logo inline if a file can't load. A skill can
// override either version with its own logo file (same folders).
//
// Entry options: Icon + color (single-colour glyph), tile (coloured rounded square behind a
// white glyph), underlay (fills the glyph's cut-outs, e.g. the white "5" in HTML5),
// gradient (glyph filled with a gradient), badge + bg (Adobe-style letter tile),
// Original/Rest (fully custom drawings). Logos that are black or white in reality
// (Next.js, Express, GitHub, Copilot, Framer, Vercel) stay white on hover.

const BOX = 64; // all built-in logos are drawn in a 64 × 64 box

function FigmaShapes({ colored }) {
  const parts = [
    ['M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z', '#1ABCFE'],
    ['M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z', '#0ACF83'],
    ['M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z', '#FF7262'],
    ['M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z', '#F24E1E'],
    ['M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z', '#A259FF'],
  ];
  return (
    <svg x="13" y="4" width="38" height="56" viewBox="0 0 38 57">
      {parts.map(([d, fill]) => <path key={d} d={d} fill={colored ? fill : '#FFFFFF'} />)}
    </svg>
  );
}

// AWS wordmark: white "aws" (its dark-background version) with the orange smile.
function AwsShapes({ colored }) {
  const smile = colored ? '#FF9900' : '#FFFFFF';
  return (
    <>
      <text x="32" y="35" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="25" fill="#FFFFFF">aws</text>
      <path d="M10 42 Q32 54 53 42" fill="none" stroke={smile} strokeWidth="4" strokeLinecap="round" />
      <path d="M46 39.5 L54.5 41.5 L51 49" fill="none" stroke={smile} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

const ADOBE = (badge, bg, color, label) => ({ label, badge, bg, color });

export const SKILL_ICONS = {
  react: { label: 'React', color: '#61DAFB', Icon: FaReact },
  nextjs: { label: 'Next.js', color: '#FFFFFF', Icon: SiNextdotjs },
  nodejs: { label: 'Node.js', color: '#5FA04E', Icon: FaNodeJs },
  express: { label: 'Express.js', color: '#FFFFFF', Icon: SiExpress },
  javascript: { label: 'JavaScript', color: '#F7DF1E', Icon: FaJsSquare, underlay: { shape: 'rect', fill: '#000000', inset: 13 } },
  typescript: { label: 'TypeScript', color: '#3178C6', Icon: SiTypescript, underlay: { shape: 'rect', fill: '#FFFFFF', inset: 11 } },
  html5: { label: 'HTML5', color: '#E34F26', Icon: FaHtml5, underlay: { shape: 'rect', fill: '#FFFFFF', x: 21, y: 14, w: 22, h: 34 } },
  css3: { label: 'CSS3', color: '#1572B6', Icon: FaCss3Alt, underlay: { shape: 'rect', fill: '#FFFFFF', x: 21, y: 14, w: 22, h: 34 } },
  tailwind: { label: 'Tailwind CSS', color: '#06B6D4', Icon: SiTailwindcss },
  mongodb: { label: 'MongoDB', color: '#47A248', Icon: SiMongodb },
  mysql: { label: 'MySQL', color: '#4479A1', Icon: SiMysql },
  firebase: { label: 'Firebase', Icon: SiFirebase, gradient: ['#FF9100', '#FFC400'] },
  openai: { label: 'OpenAI / ChatGPT / Codex', color: '#FFFFFF', Icon: BsOpenai, tile: '#10A37F' },
  claude: { label: 'Claude', color: '#D97757', Icon: SiClaude },
  gemini: { label: 'Gemini', Icon: SiGooglegemini, gradient: ['#4796E3', '#9177C7', '#CA6673'] },
  copilot: { label: 'GitHub Copilot', color: '#FFFFFF', Icon: SiGithubcopilot },
  figma: { label: 'Figma', Original: () => <FigmaShapes colored />, Rest: () => <FigmaShapes /> },
  framer: { label: 'Framer', color: '#FFFFFF', Icon: SiFramer },
  photoshop: ADOBE('Ps', '#001E36', '#31A8FF', 'Photoshop (Ps tile)'),
  illustrator: ADOBE('Ai', '#330000', '#FF9A00', 'Illustrator (Ai tile)'),
  xd: ADOBE('Xd', '#470137', '#FF61F6', 'Adobe XD (Xd tile)'),
  'after-effects': ADOBE('Ae', '#00005B', '#9999FF', 'After Effects (Ae tile)'),
  'premiere-pro': ADOBE('Pr', '#00005B', '#9999FF', 'Premiere Pro (Pr tile)'),
  lightroom: ADOBE('Lr', '#001E36', '#31A8FF', 'Lightroom (Lr tile)'),
  git: { label: 'Git', color: '#F05032', Icon: SiGit },
  github: { label: 'GitHub', color: '#FFFFFF', Icon: SiGithub },
  docker: { label: 'Docker', color: '#2496ED', Icon: SiDocker },
  aws: { label: 'AWS', Original: () => <AwsShapes colored />, Rest: () => <AwsShapes /> },
  vscode: { label: 'VS Code', color: '#007ACC', Icon: VscVscode },
  postman: { label: 'Postman', color: '#FF6C37', Icon: SiPostman, underlay: { shape: 'circle', fill: '#FFFFFF', r: 19 } },
  vercel: { label: 'Vercel', color: '#FFFFFF', Icon: SiVercel },
  netlify: { label: 'Netlify', color: '#00C7B7', Icon: SiNetlify },
  kubernetes: { label: 'Kubernetes', color: '#326CE5', Icon: SiKubernetes, underlay: { shape: 'circle', fill: '#FFFFFF', r: 17 } },
  jenkins: { label: 'Jenkins', color: '#D24939', Icon: SiJenkins },
  linux: { label: 'Linux', color: '#FCC624', Icon: SiLinux },
};

export const CATEGORY_ICONS = {
  code: { label: 'Code', Icon: FaCode },
  ai: { label: 'AI sparkle', Icon: BsStars },
  tools: { label: 'Tools', Icon: FaTools },
  gear: { label: 'Gear', Icon: FaCog },
  layers: { label: 'Layers', Icon: FaLayerGroup },
};

export const ICON_KEY_PATTERN = /^[a-z0-9-]{0,40}$/;

// "UX Pilot" -> "UP", "Figma" -> "Fi". Used when a skill has no logo at all.
export function monogram(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  const word = words[0] || '?';
  return word[0].toUpperCase() + (word[1] || '').toLowerCase();
}

// A pasted <svg> is shown through <img>, which never runs scripts inside the image.
export const svgDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function Letters({ text, fill, bg }) {
  return (
    <>
      {bg ? (
        <rect x="4" y="4" width="56" height="56" rx="12" fill={bg} />
      ) : (
        <rect x="6" y="6" width="52" height="52" rx="11" fill="none" stroke={fill} strokeWidth="4.5" />
      )}
      <text x="32" y="42" textAnchor="middle" fontFamily="Inter, Arial, Helvetica, sans-serif" fontWeight="700" fontSize="27" fill={fill}>
        {text}
      </text>
    </>
  );
}

function Underlay({ spec }) {
  if (spec.shape === 'circle') return <circle cx="32" cy="32" r={spec.r} fill={spec.fill} />;
  const x = spec.x ?? spec.inset;
  const y = spec.y ?? spec.inset;
  return <rect x={x} y={y} width={spec.w ?? BOX - 2 * x} height={spec.h ?? BOX - 2 * y} fill={spec.fill} />;
}

// Built-in logo as a stand-alone <svg>. `colored` picks the original version; otherwise white.
// This drawing is what scripts/upload-tech-logos.js uploads to Cloudinary, and the fallback.
export function BuiltInLogo({ iconKey, colored = false, size = BOX, gradientId }) {
  const entry = SKILL_ICONS[iconKey];
  if (!entry) return null;
  const gid = gradientId || `ti-grad-${iconKey}`;
  let body;
  if (entry.Original) {
    body = colored ? <entry.Original /> : <entry.Rest />;
  } else if (entry.badge) {
    body = colored ? <Letters text={entry.badge} fill={entry.color} bg={entry.bg} /> : <Letters text={entry.badge} fill="#FFFFFF" />;
  } else {
    const pad = entry.tile ? 13 : 6;
    const fill = !colored ? '#FFFFFF' : entry.gradient ? `url(#${gid})` : entry.color;
    body = (
      <>
        {colored && entry.gradient && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              {entry.gradient.map((stop, i) => (
                <stop key={stop} offset={entry.gradient.length === 1 ? 0 : i / (entry.gradient.length - 1)} stopColor={stop} />
              ))}
            </linearGradient>
          </defs>
        )}
        {colored && entry.tile && <rect x="2" y="2" width="60" height="60" rx="14" fill={entry.tile} />}
        {colored && entry.underlay && <Underlay spec={entry.underlay} />}
        <entry.Icon x={pad} y={pad} size={BOX - 2 * pad} fill={fill} stroke="none" />
      </>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${BOX} ${BOX}`} width={size} height={size} aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}

function Monogram({ name, size }) {
  return (
    <svg viewBox={`0 0 ${BOX} ${BOX}`} width={size} height={size} aria-hidden="true" focusable="false">
      <Letters text={monogram(name)} fill="#FFFFFF" />
    </svg>
  );
}

function LogoImage({ src, size, white, onError }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={onError}
      className={`object-contain ${white ? 'ti-white' : ''}`}
      style={{ width: size, height: size }}
    />
  );
}

// Logo files for a skill document. Legacy fields (iconSvg / iconUrl from before the cloud
// logos) count as the hover version for skills without a built-in icon.
export function skillLogoSources(skill) {
  const legacy = !SKILL_ICONS[skill.icon] && (skill.iconSvg ? svgDataUri(skill.iconSvg) : skill.iconUrl || '');
  return {
    defaultSrc: skill.logoDefault?.url || '',
    hoverSrc: skill.logoHover?.url || legacy || '',
  };
}

// Skill logo with both versions stacked; inside a `.ti-host` element (card, row) hovering
// cross-fades to the original version with a small lift (techIcon.css).
//   rest:  skill's default file → built-in white (cloud file) → hover file in white → initials tile
//   hover: skill's hover file → built-in original (cloud file) → default file → same as rest
export function TechIcon({ icon, name, defaultSrc = '', hoverSrc = '', size = 32, kind = 'skill', className = '' }) {
  const [failed, setFailed] = useState({});
  if (kind === 'category') {
    const entry = CATEGORY_ICONS[icon];
    const Glyph = entry?.Icon;
    return Glyph ? <Glyph size={size} aria-hidden="true" focusable="false" className={`shrink-0 ${className}`} /> : <Monogram name={name} size={size} />;
  }

  const builtIn = Boolean(SKILL_ICONS[icon]);
  const okDefault = defaultSrc && !failed[defaultSrc] ? defaultSrc : '';
  const okHover = hoverSrc && !failed[hoverSrc] ? hoverSrc : '';
  const fail = (src) => () => setFailed((f) => ({ ...f, [src]: true }));

  // Built-in logo: the Cloudinary file, or the inline drawing if it can't load.
  const builtInLogo = (variant) => {
    const src = CLOUD_LOGOS[icon]?.[variant]?.url;
    if (src && !failed[src]) return <LogoImage src={src} size={size} onError={fail(src)} />;
    return <BuiltInLogo iconKey={icon} colored={variant === 'hover'} size={size} />;
  };

  let rest;
  if (okDefault) rest = <LogoImage src={okDefault} size={size} onError={fail(okDefault)} />;
  else if (builtIn) rest = builtInLogo('default');
  else if (okHover) rest = <LogoImage src={okHover} size={size} white onError={fail(okHover)} />;
  else rest = <Monogram name={name} size={size} />;

  let hover;
  if (okHover) hover = <LogoImage src={okHover} size={size} onError={fail(okHover)} />;
  else if (builtIn) hover = builtInLogo('hover');
  else hover = rest;

  return (
    <span className={`ti-stack shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span className="ti-rest">{rest}</span>
      <span className="ti-hover" aria-hidden="true">{hover}</span>
    </span>
  );
}

export function SkillLogo({ skill, size }) {
  return <TechIcon icon={skill.icon} name={skill.name} size={size} {...skillLogoSources(skill)} />;
}
