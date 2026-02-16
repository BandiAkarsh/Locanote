# Locanote Desktop

A lightweight, fast desktop application for Locanote that works **completely offline** like Notepad, with all features retained. When you have internet, it syncs with others in real-time.

## ✨ How It Works

### Offline-First (Like Notepad)

- ✅ **Works without internet** - All features available offline
- ✅ **Your notes are stored locally** - On your device, always accessible
- ✅ **Edit anytime** - Create, edit, format notes without connection
- ✅ **Privacy first** - No data leaves your device until you choose to share

### Online Sync (When Connected)

- ✅ **Auto-sync when online** - Changes sync automatically
- ✅ **Real-time collaboration** - Others can edit with you live
- ✅ **Share via links** - Generate links to collaborate
- ✅ **Encryption** - End-to-end encryption for shared notes

## Features

✅ **All Web Features** - Real-time collaboration, encryption, export, etc.
✅ **Native Experience** - System tray, keyboard shortcuts, native menus
✅ **100% Offline Capable** - Works completely without internet
✅ **Auto-Updater** - Automatically checks for and installs updates
✅ **Cross-Platform** - Windows, macOS, and Linux
✅ **Lightweight** - ~5MB download, minimal RAM usage
✅ **Secure** - Sandboxed environment with CSP protection

## Download & Install

### Option 1: Download Pre-built Binaries

Coming soon! Check the [Releases](https://github.com/BandiAkarsh/Locanote/releases) page.

### Option 2: Build from Source

#### Prerequisites

1. **Install Rust** (required for Tauri):

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Node.js** (for Tauri CLI):

   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

3. **Install system dependencies**:

   **macOS:**

   ```bash
   xcode-select --install
   brew install openssl@3
   ```

   **Linux (Ubuntu/Debian):**

   **Ubuntu 24.04+ (Newer versions):**

   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev \
     pkg-config
   ```

   **Ubuntu 22.04 and older:**

   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev \
     build-essential \
     curl \
     wget \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev \
     pkg-config
   ```

   **Windows:**
   - Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install WebView2 runtime (usually already installed)

#### Build Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/BandiAkarsh/Locanote.git
   cd Locanote/apps/desktop
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Generate icons** (if needed):

   ```bash
   python3 generate-icons.py
   python3 create-ico.py
   python3 create-icns.py
   ```

4. **Build the app**:

   ```bash
   # Development build (for testing)
   npm run dev

   # Production build
   npm run build
   ```

5. **Find your installer**:
   - **Windows**: `src-tauri/target/release/bundle/msi/*.msi`
   - **macOS**: `src-tauri/target/release/bundle/dmg/*.dmg`
   - **Linux**: `src-tauri/target/release/bundle/deb/*.deb` or `AppImage/*.AppImage`

## Usage

### Using Like Notepad (Offline)

The app works **completely offline** - just like Windows Notepad:

1. **Open the app** - Works without internet
2. **Create notes** - Click "New Note" or File → New
3. **Type freely** - Large, comfortable text size (20px default)
4. **Format text** - Use the toolbar or Format menu
5. **Save locally** - Everything saves automatically to your device
6. **No internet needed** - All features work offline

### Online Collaboration (Optional)

When you WANT to collaborate:

1. **Connect to internet**
2. **Click "Share"** in the toolbar
3. **Copy the link** and send to others
4. **Edit together** in real-time
5. **Disconnect anytime** - Continue editing offline

### Interface Layout (Notepad++ Style)

```
┌─────────────────────────────────────────────────────────┐
│ File  Edit  Share                      [Share] [Export] │  ← Menu Bar
├─────────────────────────────────────────────────────────┤
│ My Note Title                                           │  ← Title
├─────────────────────────────────────────────────────────┤
│ B  I  S  |  H  •  1.  |  </>  "                        │  ← Toolbar
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your note content goes here...                         │  ← Editor
│  Large, easy-to-read text (20px)                        │
│                                                         │
│  • Bullet points                                        │
│  • Numbered lists                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

- **Ctrl/Cmd + N**: New note
- **Ctrl/Cmd + S**: Save (auto-saves)
- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + F**: Find in page
- **Ctrl/Cmd + +/-**: Zoom in/out
- **Ctrl/Cmd + 0**: Reset zoom
- **F11**: Fullscreen

### System Tray

The app runs in the system tray:

- **Left-click** on tray icon: Show/hide window
- **Right-click** on tray icon: Menu with Show/Hide/Quit options

### Offline vs Online

| Feature                 | Offline | Online |
| ----------------------- | ------- | ------ |
| Create notes            | ✅      | ✅     |
| Edit notes              | ✅      | ✅     |
| Format text             | ✅      | ✅     |
| Export                  | ✅      | ✅     |
| Password protection     | ✅      | ✅     |
| Real-time collaboration | ❌      | ✅     |
| Share via link          | ❌      | ✅     |
| Sync with others        | ❌      | ✅     |

## Development

### Project Structure

```
apps/desktop/
├── src-tauri/
│   ├── src/
│   │   └── main.rs          # Rust entry point
│   ├── icons/               # App icons (PNG, ICO, ICNS)
│   ├── Cargo.toml           # Rust dependencies
│   ├── tauri.conf.json      # Tauri configuration
│   └── build.rs             # Build script
├── package.json             # Node.js dependencies
├── generate-icons.py        # Icon generation script
└── README.md                # This file
```

### Development Mode

```bash
# Run in development mode (hot reload)
npm run tauri dev
```

This will:

1. Start the Tauri development server
2. Open the app in a window
3. Auto-reload on code changes

### Building for Distribution

```bash
# Build for current platform
npm run build

# Build for specific platforms (requires appropriate toolchain)
npm run build:mac      # macOS universal binary
npm run build:win      # Windows x64
npm run build:linux    # Linux x64
npm run build:all      # All platforms (requires cross-compilation setup)
```

### Customization

#### Change the URL

Edit `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "devPath": "https://your-url.com",
    "distDir": "https://your-url.com"
  }
}
```

#### Window Size

Edit `src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "windows": [
      {
        "width": 1400,
        "height": 900,
        "minWidth": 1000,
        "minHeight": 700
      }
    ]
  }
}
```

#### System Tray Icon

Replace `src-tauri/icons/icon.png` with your own 512x512 PNG icon, then regenerate icons:

```bash
python3 generate-icons.py
python3 create-ico.py
python3 create-icns.py
```

## Troubleshooting

### Build Errors

**Error: `cargo: command not found`**

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Error: `openssl` not found (macOS)**

```bash
brew install openssl@3
export PKG_CONFIG_PATH="/opt/homebrew/opt/openssl@3/lib/pkgconfig"
```

**Error: `libwebkit2gtk` not found (Linux)**

```bash
sudo apt install libwebkit2gtk-4.0-dev
```

### App Shows Blank Screen

1. Check internet connection (first load requires internet)
2. Check if `https://locanote.pages.dev` is accessible in browser
3. Try clearing app data:
   - **Windows**: Delete `%APPDATA%/com.locanote.app`
   - **macOS**: Delete `~/Library/Application Support/com.locanote.app`
   - **Linux**: Delete `~/.config/com.locanote.app`

### Auto-Updater Not Working

The auto-updater requires:

1. Signed releases (requires code signing certificate)
2. Public releases on GitHub
3. Correct public key in `tauri.conf.json`

For development/testing, you can disable it in `tauri.conf.json`:

```json
{
  "tauri": {
    "updater": {
      "active": false
    }
  }
}
```

## Security

The desktop app includes several security features:

- **CSP (Content Security Policy)**: Restricts what resources can be loaded
- **Context Isolation**: Prevents JavaScript injection
- **Sandbox**: Runs web content in isolated process
- **No Node.js Access**: Web content cannot access filesystem directly
- **LocalStorage/IndexedDB**: Data stored locally and encrypted

## Architecture

```
┌─────────────────────────────────────────┐
│  Tauri Desktop App (Rust + WebView)    │
│  ┌───────────────────────────────────┐  │
│  │  System Tray, Menus, Shortcuts    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  WebView (WKWebView/WebView2/     │  │
│  │  WebKitGTK)                       │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Locanote Web App           │  │  │
│  │  │  (locanote.pages.dev)       │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on your platform
5. Submit a pull request

## License

MIT License - see [LICENSE](../../LICENSE) file

## Support

- GitHub Issues: https://github.com/BandiAkarsh/Locanote/issues
- Documentation: https://github.com/BandiAkarsh/Locanote/blob/main/README.md

---

Built with [Tauri](https://tauri.app) ❤️
