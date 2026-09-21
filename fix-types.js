const fs = require('fs');
const file = 'artifacts/rgg-website/src/types/admin.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'authors: ResearchAuthor[];',
  `authors: ResearchAuthor[];
  themeId?: string | null;
  language?: "english" | "french" | "bilingual";
  pdfMediaId?: string | null;
  featuredImageMediaId?: string | null;`
);

code = code.replace(
  'displayOrder: number;',
  `displayOrder: number;
  language?: "english" | "french" | "bilingual";
  verificationNote?: string | null;
  verified?: boolean;
  photoMediaId?: string | null;`
);

fs.writeFileSync(file, code);
