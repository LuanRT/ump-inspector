<div align="center">
  <br/>
  <a href="https://github.com/LuanRT/ump-inspector">
    <img src="assets/logo-512.png" alt="UMP Inspector Logo" width="200" />
  </a>
  <br/>
  <br/>

  [![NPM](https://img.shields.io/github/v/release/LuanRT/ump-inspector?color=blue)](https://github.com/LuanRT/ump-inspector/releases)
  [![License](https://img.shields.io/github/license/LuanRT/ump-inspector?color=blue)](./LICENSE)

</div>

> A browser extension that intercepts the `fetch` API to capture, decode, and display YouTube UMP network traffic in a human-readable format.

- [Installation](#installation)
- [Building from Source](#building-from-source)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [License](#license)

## Installation

To install this extension, you need to load it as an unpacked extension in your browser.

1.  Download the latest `ump-inspector-vX.X.X.zip` from the [releases page](https://github.com/LuanRT/ump-inspector/releases).
2.  Unzip the downloaded file.
3.  Open your browser and navigate to the extensions page:
    *   **Chrome/Brave:** `chrome://extensions`
    *   **Edge:** `edge://extensions`
    *   **Firefox:** `about:debugging#/runtime/this-firefox`
4.  Enable "Developer mode".
5.  Click on "Load unpacked" (or "Load Temporary Add-on" in Firefox) and select the directory where you unzipped the files.

## Building from Source

If you want to build the extension from the source code, follow these steps:

1.  Clone the repository:
    ```sh
    git clone https://github.com/LuanRT/ump-inspector.git
    cd ump-inspector
    ```

2.  Install the dependencies:
    ```sh
    npm install
    ```

3.  Build the project:
    ```sh
    npm run build
    ```
4.  Follow the steps in the Installation section, but select the root directory of the project instead of the unzipped release folder.

## Usage

1. Open any YouTube video.
2. Click the button in the bottom-right corner to launch the inspector panel.

**Note:** You can hide the UI at any time by toggling the "Enabled" option in the extension popup.

## Screenshots

<details>
  <summary><b>Click to expand screenshots</b></summary>
  <br/>

  <div align="center">
    <img src="/assets/screenshots/extension-popup.png" width="300" alt="Popup" />
    <br/><br/>
    <img src="/assets/screenshots/panel-screenshot-1.png" width="80%" alt="Screenshot 1" />
    <img src="/assets/screenshots/panel-screenshot-2.png" width="80%" alt="Screenshot 2" />
    <br/><br/>
    <img src="/assets/screenshots/panel-screenshot-3.png" width="80%" alt="Screenshot 3" />
  </div>
</details>

## License
Distributed under the [MIT](./LICENSE) License.

<p align="right">