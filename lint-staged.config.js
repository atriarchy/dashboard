const config = {
  "*/**/*.{js,jsx,ts,tsx}": [
    "npx prettier --write --ignore-unknown",
    "SKIP_ENV_VALIDATION=1 npx eslint --fix",
    "SKIP_ENV_VALIDATION=1 npx eslint",
  ],
  "*/**/*.{json,css,md}": ["npx prettier --write"],
};

export default config;
