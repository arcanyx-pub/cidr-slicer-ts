set shell := ["bash", "-euo", "pipefail", "-c"]

# List available recipes.
default:
    @just --list

# Install dependencies.
install:
    npm ci

# Build the dual ESM/CJS output into dist/.
build:
    npm run build

# Run the test suite.
test:
    npm test

# Run the full CI gate locally (build, exports guard, typecheck, lint, test).
check:
    npm run build
    npm run check:exports
    npm run typecheck
    npm run lint
    npm test

# Preview the published tarball contents without publishing.
pack-preview:
    npm run build
    npm pack --dry-run

# Bump the version (patch|minor|major) and commit. Run on your feature branch;
# the bump commit rides along in your normal PR. After merge, run `just publish`.
bump level:
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{level}}" in
        patch|minor|major) ;;
        *) echo "usage: just bump <patch|minor|major>" >&2; exit 1 ;;
    esac
    branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$branch" == "main" ]]; then
        echo "refusing to bump on main; create a feature branch first" >&2
        exit 1
    fi
    new_version=$(npm version --no-git-tag-version "{{level}}")
    git add package.json package-lock.json
    git commit -m "Release ${new_version}"
    echo "Bumped to ${new_version}. Push this branch, open a PR, and after it"
    echo "merges to main run 'just publish'."

# Tag the current main commit as v<version> and push it, triggering the npm
# publish workflow. Run after the version-bump PR has merged.
publish:
    #!/usr/bin/env bash
    set -euo pipefail
    branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$branch" != "main" ]]; then
        echo "publish must be run from main (currently on '$branch')" >&2
        exit 1
    fi
    if [[ -n "$(git status --porcelain)" ]]; then
        echo "working tree is dirty; commit or stash before releasing" >&2
        exit 1
    fi
    git pull --ff-only
    version="v$(node -p "require('./package.json').version")"
    if git rev-parse "$version" >/dev/null 2>&1; then
        echo "tag $version already exists; did you forget to 'just bump'?" >&2
        exit 1
    fi
    git tag -a "$version" -m "$version"
    git push origin "$version"
    echo "Pushed $version. The publish workflow will publish to npm."
