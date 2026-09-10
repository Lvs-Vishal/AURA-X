const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

const replacements = [
  { search: /grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8/g, replace: 'flex flex-col gap-6' },
  { search: /grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4/g, replace: 'grid grid-cols-2 gap-4' },
  { search: /grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6/g, replace: 'flex flex-col gap-6' },
  { search: /grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4/g, replace: 'grid grid-cols-2 gap-4' },
  { search: /flex flex-col md:flex-row md:items-center justify-between gap-4/g, replace: 'flex flex-col gap-4' },
  { search: /grid grid-cols-1 md:grid-cols-2 gap-8/g, replace: 'flex flex-col gap-6' },
  { search: /grid grid-cols-1 md:grid-cols-12 gap-8 relative/g, replace: 'flex flex-col gap-8 relative' },
  { search: /grid grid-cols-2 md:grid-cols-5 gap-4/g, replace: 'grid grid-cols-2 gap-4' },
  { search: /grid grid-cols-1 md:grid-cols-3 gap-6/g, replace: 'flex flex-col gap-4' },
  { search: /grid grid-cols-1 lg:grid-cols-2 gap-8/g, replace: 'flex flex-col gap-8' },
  { search: /md:col-span-5/g, replace: '' },
  { search: /md:col-span-7/g, replace: '' },
  { search: /md:gap-8/g, replace: 'gap-6' },
  { search: /md:p-8/g, replace: 'p-6' },
  { search: /md:pl-0/g, replace: '' },
  { search: /md:left-\[35px\]/g, replace: '' },
  { search: /md:flex-row/g, replace: 'flex-col' },
  { search: /sm:flex-row/g, replace: 'flex-col' },
  { search: /lg:col-span-8/g, replace: '' },
  { search: /lg:col-span-4/g, replace: '' },
];

fs.readdirSync(screensDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    let content = fs.readFileSync(path.join(screensDir, file), 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(path.join(screensDir, file), content);
  }
});

console.log('Done!');
