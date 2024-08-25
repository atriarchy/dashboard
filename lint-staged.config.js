const config = {
  "*/**/*.{js,jsx,ts,tsx}": [
    "npx prettier --write --ignore-unknown",
    "npx eslint --fix",
    "npx eslint",
  ],
  "*/**/*.{json,css,md}": ["npx prettier --write"],
};

export default config;
