# Git Hooks (Husky)

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Hooks

### pre-commit

Runs before every commit:

- **lint-staged**: Formats and lints only the files you're committing
  - Runs Prettier to auto-format code
  - Runs ESLint with --fix to auto-fix linting issues

This ensures all committed code is properly formatted and passes linting.

### pre-push

Runs before pushing to remote:

- **type-check**: Runs TypeScript compiler to check for type errors

This catches TypeScript errors before they reach CI.

## Why This Helps

1. **Catch issues early**: Find problems before CI runs
2. **Consistent formatting**: All code is auto-formatted on commit
3. **Faster feedback**: No waiting for CI to tell you about lint errors
4. **Cleaner history**: Only well-formatted code gets committed

## Skipping Hooks

If you absolutely need to skip hooks (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

**Note**: This should be rare! The hooks are there to help you.

## Disabling Hooks

To temporarily disable all hooks:

```bash
# Rename the .husky directory
mv .husky .husky.disabled

# Re-enable later
mv .husky.disabled .husky
```

## Updating Hooks

To modify what runs in the hooks, edit the hook files directly:

- `.husky/pre-commit`
- `.husky/pre-push`

Or update the `lint-staged` configuration in `package.json`.
