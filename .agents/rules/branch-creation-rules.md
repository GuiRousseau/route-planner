# Branch Creation Rules

## Rule: Use the Required Branch Name Format

- **Requirement**: Every new branch created for this project must follow this format:
  - `feature/<basic-summary-of-branch>` for new functionality
  - `fix/<basic-summary-of-branch>` for bug fixes
- **Prefix**: Use exactly `feature` or `fix`, in lowercase.
- **Summary**: Use a concise, descriptive summary in lowercase kebab-case:
  - Include only lowercase letters, numbers, and single hyphens between words.
  - Do not use spaces, underscores, additional slashes, or punctuation.
  - Do not leave the summary empty or begin or end it with a hyphen.
- **Literal brackets**: The square brackets in the format description are placeholders and must not appear in the branch name.
- **Before creating a branch**: Choose the prefix that matches the work, form the summary, and verify the complete name against these rules.

### Examples

- `feature/add-route-export`
- `feature/show-trip-duration`
- `fix/prevent-empty-destinations`
- `fix/correct-route-distance`

### Invalid Examples

- `Feature/add-route-export` — prefix must be lowercase
- `feature/add_route_export` — use hyphens instead of underscores
- `fix/Correct-Route-Distance` — summary must be lowercase
- `feature/add/route-export` — summary must not contain additional slashes
- `fix/` — summary is required