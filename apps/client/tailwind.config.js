const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

const globDeps = createGlobPatternsForDependencies(
  __dirname,
  '**/!(*.stories|*.spec).{tsx,jsx,ts,js,html}'
);

module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...globDeps,
  ],
  theme: {},
  plugins: [],
};
