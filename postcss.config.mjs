/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Updated naming convention
    autoprefixer: {},
  },
};

export default config;