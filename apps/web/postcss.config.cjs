// @ts-expect-error - No types for postcss
module.exports = require('@kit/tailwind-config/postcss');

module.exports = {
    plugins: {
        "postcss-import": {},
        "tailwindcss/nesting": {},
        tailwindcss: {},
        autoprefixer: {},
    },
}