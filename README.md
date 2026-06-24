A browser extension that hijacks the `fetch` API to capture UMP requests and responses on YouTube, decodes them, and displays the information in a human readable format.

## Screenshots

Settings popup:

| [![Popup](/assets/screenshots/extension-popup.png "Popup")](/assets/screenshots/extension-popup.png) |
| ---------------------------------------------------------------- |

In-page panel:

| [![Screenshot 1](/assets/screenshots/panel-screenshot-1.png "Screenshot 1")](/assets/screenshots/panel-screenshot-1.png) | [![Screenshot 2](/assets/screenshots/panel-screenshot-2.png "Screenshot 2")](/assets/screenshots/panel-screenshot-2.png) | [![Screenshot 3](/assets/screenshots/panel-screenshot-3.png "Screenshot 3")](/assets/screenshots/panel-screenshot-3.png) |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |

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

After installation, navigate to any YouTube page that plays a video. A button will appear in the bottom-right corner of the page. Click it to open the in-page panel. To prevent the button and panel from appearing on the page, you can toggle the "Enabled" option in the extension's settings popup.

## License
Distributed under the [MIT](./LICENSE) License.

<p align="right">
(<a href="#top">back to top</a>)
</p>