# ump-inspector

A browser extension for inspecting and debugging UMP requests on YouTube. It hooks into the response processing to provide decoded, human-readable info into the UMP parts as well as request payloads.

## Screenshots
<img width="682" height="581" alt="Screenshot 2025-09-23 211703" src="https://github.com/user-attachments/assets/7da0980b-23ea-4e8a-b32a-2e1ec481ea7c" />

## Installation

To install this extension, you need to load it as an unpacked extension in a Chromium-based browser.

1.  Download the latest `ump-inspector-vX.X.X.zip` from the [releases page](https://github.com/LuanRT/ump-inspector/releases).
2.  Unzip the downloaded file.
3.  Open your browser and navigate to the extensions page (e.g., `chrome://extensions`, `edge://extensions`, or `about:addons` for Mozilla-based browsers).
4.  Enable "Developer mode".
5.  Click on "Load unpacked" and select the directory where you unzipped the files.

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
    This will create a `dist` directory containing the bundled extension files.

4.  Follow the steps in the [Installation](#installation) section, but select the root directory of the project instead of the unzipped release folder.

## Usage

After installation, simply navigate to any YouTube page that plays a video. Open your browser's **Developer Tools** (F12 or Ctrl+Shift+I) and select the **Console** tab. The extension will automatically log the decoded payloads and UMP parts as they are received and processed.

## License
Distributed under the [MIT](./LICENSE) License.

<p align="right">
(<a href="#top">back to top</a>)
</p>
