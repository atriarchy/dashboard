const config = {
  "*/**/*.{js,jsx,ts,tsx}": [
    "prettier --write --ignore-unknown",
    "SKIP_ENV_VALIDATION=1 eslint --fix",
    "SKIP_ENV_VALIDATION=1 eslint",
  ],
  "*/**/*.{json,css,md}": ["prettier --write"],
};

export default config;
