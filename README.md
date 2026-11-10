<div align="center">
  <img src="extension/icons/favicon.png" alt="CyberKeyGen" width="100"/>
  <h1>CyberKeyGen</h1>
  <p><strong>Advanced Password Generator & Security Tool</strong></p>

  [![License](https://img.shields.io/github/license/karthik558/CyberKeyGen)](LICENSE)
  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fpassword.karthiklal.in)](https://password.karthiklal.in)
  [![GitHub](https://img.shields.io/github/stars/karthik558/CyberKeyGen)](https://github.com/karthik558/CyberKeyGen)
</div>

## About the Project

CyberKeyGen is a modern, secure password generator that helps you create strong, unique passwords for your accounts. Built with React and TypeScript, it features a premium, unified monochrome (black and white) grayscale user interface, adaptive dark mode rendering, real-time password strength analysis, and a corresponding browser extension.

## Project Status

<div align="left">

**Current Version: 3.3.5**

| Feature               | Status |
| --------------------- | ------ |
| Core Generator        | ✅     |
| Password Strength     | ✅     |
| Monochrome Dark Mode  | ✅     |
| Mobile Support        | ✅     |
| PWA Support           | ✅     |
| Aligned Extension     | ✅     |

</div>

## Features

- 🔐 **Advanced Security**
  - Cryptographically secure random number generation
  - Real-time password strength assessment
  - Time-to-crack estimation
  - Password history management
  - Pronounceable password generation 🆕
  - PIN code generation (4-12 digits) 🆕

- 🎨 **Modern Interface**
  - Premium monochrome (black and white) grayscale design
  - Clean, intuitive user interface
  - Adaptive Dark/Light theme support
  - Responsive design for all devices

- ⚙️ **Customization Options**
  - Password length (8-128 characters)
  - Character type selection
    - Uppercase letters (A-Z)
    - Lowercase letters (a-z)
    - Numbers (0-9)
    - Special characters (!@#$%^&*)
  - Exclude ambiguous characters

- 🔄 **Additional Features**
  - Password history tracking (saved locally)
  - Password categories
  - Security tips and recommendations
  - Progressive Web App (PWA) support
  - Share passwords via QR code 
  - Keyboard shortcuts for quick access
  - Browser extension for quick access 🆕 

## Screenshots (Web Interface)

<div align="center">
  <table>
    <tr>
      <td><img src="https://raw.githubusercontent.com/FoORK-Lab/pass-gen-dependencies/refs/heads/main/passgen-light.png" alt="CyberKeyGen Main Interface Light" width="500"/></td>
      <td><img src="https://raw.githubusercontent.com/FoORK-Lab/pass-gen-dependencies/refs/heads/main/passgen-dark.png" alt="CyberKeyGen Main Interface Dark" width="500"/></td>
    </tr>
    <tr>
      <td align="center"><strong>Light Mode</strong></td>
      <td align="center"><strong>Dark Mode</strong></td>
    </tr>
  </table>
</div>

## Screenshots (Browser Extension)

<div align="center">
  <table>
    <tr>
      <td><img src="https://raw.githubusercontent.com/FoORK-Lab/pass-gen-dependencies/refs/heads/main/extension-light.png" alt="CyberKeyGen Extension Light Mode" width="250"/></td>
      <td><img src="https://raw.githubusercontent.com/FoORK-Lab/pass-gen-dependencies/refs/heads/main/extension-dark.png" alt="CyberKeyGen Extension Dark Mode" width="250"/></td>
    </tr>
    <tr>
      <td align="center"><strong>Light Mode</strong></td>
      <td align="center"><strong>Dark Mode</strong></td>
    </tr>
  </table>
</div>

## Screenshots (Context Menu)

<div align="center">
<table>
  <td><img src="https://raw.githubusercontent.com/FoORK-Lab/pass-gen-dependencies/refs/heads/main/context_menu.png" alt="CyberKeyGen Context Menu" width="300"/></td>
  <tr>
  <td><p align="center"><strong>Context Menu for Quick Password Generation</strong></p></td>
  </tr>
</table>
</div>

## Usage

1. **Access the Generator**
   - Visit [https://password.karthiklal.in](https://password.karthiklal.in)
   - Or run locally using the installation instructions below

2. **Configure Password Settings**
   - Set desired password length using the slider
   - Select character types to include
   - Enable/disable additional options
   - Choose between random or leet speak generation

3. **Generate & Copy**
   - Click "Generate Password"
   - Use the copy button to copy to clipboard
   - Check password strength indicator
   - Save to history if needed

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/karthik558/CyberKeyGen.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Make Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Submit a Pull Request**
   - Describe your changes in detail
   - Link any related issues

## Web Technology

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Package Manager**: npm/yarn
- **Extension Development**: Chrome Extension APIs, WebExtension APIs, 
  Manifest V3

## Browser Extension

The CyberKeyGen browser extension brings the password generator functionality directly to your browser, allowing you to quickly generate and use secure passwords while browsing the web.

### Extension Features

- **Quick Password Generation**: Generate cryptographically secure passwords with a single click
- **Multiple Password Types**: Random passwords, pronounceable passwords, leet-speak patterns, and numeric PINs
- **Direct Form Filling**: Fill passwords and confirmation fields directly into web forms with element verification
- **Password History & Favorites**: Track and save your generated passwords
- **Keyboard Shortcuts**: Generate passwords with Alt+Shift+G and open popup with Alt+P
- **Dark/Light Mode**: Unified monochrome theme with automatic OS matching
- **Persistent Storage**: Uses `chrome.storage.local` to safely retain user preferences, history, and favorites across browser restarts (compared to session storage in the web app)

### Pre-Release & Packaging Verification

Before publishing or releasing a new update, verify builds and extension packaging:

```bash
# 1. Run linter
npm run lint

# 2. Build web application
npm run build

# 3. Package extension zip into dist/
npm run build:extension
```

### Installation

#### Manual Installation (Developer Mode)

1. Download the extension from the [Release Page](https://github.com/karthik558/CyberKeyGen/releases)
2. Extract the downloaded zip file to a folder named `browser extension` (or any name you prefer)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the `browser extension` folder

#### Quick Testing (Optional)

Run the test script to build the extension package:
```bash
bash test-extension.sh
```

The packaged extension will be available in the `dist` directory.

### Version Management & Release (For developers)

To update the extension version:

```bash
# Update patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Update minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Update major version (1.0.0 -> 2.0.0)
npm run version:major
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
**⭐ Star us on GitHub — it motivates me a lot!**

[Report Bug](https://github.com/karthik558/CyberKeyGen/issues) •
[Request Feature](https://github.com/karthik558/CyberKeyGen/issues)

</div> 