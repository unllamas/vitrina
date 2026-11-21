// Conventional Commits. El tipo y el ámbito van en inglés; la descripción, en español.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["web", "ui", "kit", "docs", "scripts", "ci", "skills", "release"]],
    // La descripción puede empezar con un nombre propio.
    "subject-case": [0],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
