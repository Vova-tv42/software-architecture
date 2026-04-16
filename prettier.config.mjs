const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  bracketSpacing: true,
  endOfLine: "lf",
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss"],

  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn", "clsx", "cva"],
};

export default config;
