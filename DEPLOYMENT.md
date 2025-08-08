# Deployment Guide

This guide explains how to deploy the Directus M2A Field Selector extension to npm and GitHub.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **GitHub Account**: Create an account at [github.com](https://github.com)
3. **npm CLI**: Install npm CLI globally: `npm install -g npm`
4. **Git**: Ensure Git is installed and configured

## Step 1: Update Package Information

Before publishing, update the following in `package.json`:

```json
{
  "author": {
    "name": "Marko Siilak",
    "email": "marko@siilak.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/markosiilak/directus-extension-m2a-field-selector.git"
  },
  "bugs": {
    "url": "https://github.com/markosiilak/directus-extension-m2a-field-selector/issues"
  },
  "homepage": "https://github.com/markosiilak/directus-extension-m2a-field-selector#readme"
}
```

## Step 2: Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

## Step 3: Test the Build

```bash
npm run build
```

Ensure the build completes successfully and the `dist/` directory is created.

## Step 4: Test Package Contents

```bash
npm pack
```

This creates a `.tgz` file that you can inspect to ensure all necessary files are included.

## Step 5: Publish to npm

### First Time Publishing

```bash
npm publish --access public
```

### Subsequent Updates

1. Update version in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Update `CHANGELOG.md` with the new version

3. Commit and tag:
   ```bash
   git add .
   git commit -m "Release version X.X.X"
   git tag -a vX.X.X -m "Release version X.X.X"
   ```

4. Publish:
   ```bash
   npm publish
   ```

## Step 6: GitHub Repository Setup

### Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `directus-extension-m2a-field-selector`
3. Make it public
4. Don't initialize with README (we already have one)

### Push to GitHub

```bash
git remote add origin https://github.com/yourusername/directus-extension-m2a-field-selector.git
git branch -M main
git push -u origin main
git push --tags
```

## Step 7: Verify Installation

After publishing, verify the installation works:

```bash
# Create a test directory
mkdir test-install
cd test-install

# Install the package
npm install directus-extension-m2a-field-selector

# Verify the package contents
ls node_modules/directus-extension-m2a-field-selector/
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed and TypeScript is configured correctly
2. **Publish Errors**: Make sure you're logged into npm and the package name is available
3. **Git Issues**: Ensure your Git configuration is set up correctly

### Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md for each release
- Tag releases in Git for better tracking

## Maintenance

### Regular Tasks

1. **Dependency Updates**: Regularly update dependencies for security and compatibility
2. **Documentation**: Keep README.md and documentation up to date
3. **Testing**: Test the extension with different Directus versions
4. **Community**: Monitor issues and pull requests on GitHub

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build and test the extension
4. Commit changes and create a tag
5. Publish to npm
6. Push to GitHub
7. Create a GitHub release
