# 🤝 Contributing to Locanote

First off, thank you for considering contributing to Locanote! It's people like you that make Locanote a great tool for everyone.

I am developing this as an open-source project and I welcome contributions of all kinds: from new features and bug fixes to documentation improvements and design refinements.

## 🚀 How to Get Started

### 1. Prerequisites

- **Node.js**: v20 or higher.
- **pnpm**: The preferred package manager.
- **Wrangler**: For testing Cloudflare Workers locally.

### 2. Local Setup

```bash
# Clone the repo
git clone https://github.com/BandiAkarsh/Locanote.git
cd Locanote

# Install dependencies
pnpm install

# Start development environment
pnpm dev
```

The `pnpm dev` command will start two servers:

- **Frontend**: http://localhost:5173
- **Signaling Server**: http://localhost:8787

### 3. Creating a Pull Request

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. **Run tests** to ensure everything still works (see below).
5. Commit your changes (`git commit -m 'Add some amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request.

## 🧪 Testing

I take stability seriously. Please ensure that all tests pass before submitting a PR.

```bash
cd apps/web
pnpm test
```

I use **Playwright** for E2E testing. If you add a new feature, please consider adding a corresponding test in `apps/web/e2e/`.

## 🎨 Visual Themes

One of the best ways to contribute is by adding new **Visual Styles**. If you have a great idea for a theme (like the current Glass or Cyberpunk themes), check out `apps/web/src/app.css` to see how the CSS variable system works.

## 💬 Communication

If you have questions or want to discuss a new feature, feel free to open an **Issue** on GitHub or start a **Discussion**.

---

I am excited to see what you build! 🚀
