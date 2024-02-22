# Web ADMX tool

## Description

This app is a browser-based group policy editor, similar to the Windows Group Policy Editor. It is entirely written in JavaScript and can be accessed and run directly in your browser. You can visit the app [here](https://nekogong.gitee.io/web-admx-tool).

## Features

1. **Manage Group Policy Templates**: Easily manage group policy templates by uploading folders (containing .admx and .adml files) or JSON files, or by loading data from a server URL.

2. **View Tree Structure Policies**: View the tree structure of policies, allowing you to navigate and explore different policy settings. Switch between languages and change the scope (machine or user) to customize your view.

3. **Configure Group Policies**: Add group policies by configuring the templates directly within the browser.

4. **Manage Configurations**: Efficiently manage configurations by importing them into the app. This enables you to maintain and organize different policy configurations.

5. **View and Export Translated Registries**: Access and view translated registries. You can also export the translated registries for further analysis.

## Development

Follow these steps to get started with the app. Make sure the NodeJS is installed in your device:

```
npm install
npm run dev
```

To open the app in a new browser tab, press "o" and then hit "Enter".

## Dependencies

This app relies on the following technologies and libraries:

- [Vue3](https://vuejs.org/)
- [Element Plus](https://element-plus.org/en-US/)

## Support and Feedback

If you encounter any issues or have suggestions for improvement, please feel free to reach out to us. We appreciate your feedback and are dedicated to providing the best user experience possible.

## License

This project is licensed under the [GPL-2.0 License](LICENSE).