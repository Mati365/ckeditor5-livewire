# ckeditor5-livewire

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg?style=flat-square)](http://makeapullrequest.com)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mati365/ckeditor5-livewire?style=flat-square)
[![GitHub issues](https://img.shields.io/github/issues/mati365/ckeditor5-livewire?style=flat-square)](https://github.com/Mati365/ckeditor5-livewire/issues)

CKEditor 5 for Livewire — a lightweight WYSIWYG editor integration for Laravel. It works with Livewire components and standard Blade forms. Easy to set up, it supports custom builds, dynamic loading, and localization. The package includes JavaScript hooks, reusable components, and options for customization, and is suitable for both open-source and commercial projects.

> [!IMPORTANT]
> This integration is unofficial and not maintained by CKSource. For official CKEditor 5 documentation, visit [ckeditor.com](https://ckeditor.com/docs/ckeditor5/latest/). If you encounter any issues in editor, please report them on the [GitHub repository](https://github.com/ckeditor/ckeditor5/issues).

<p align="center">
  <img src="docs/intro-classic-editor.png" alt="CKEditor 5 Classic Editor in Laravel Livewire application">
</p>

## Under Construction 🚧

This project is still in development and not production-ready. Features, structure, and APIs may change.

## Development ⚙️

To start the development environment, run:

```bash
npm run dev
```

The playground app will be available at [http://localhost:8000](http://localhost:8000).

## Usage example ✍️

Below is a minimal Blade example showing what to add to the page `<head>` and to the `<body>` in order to render the editor powered by Livewire. The example is based on `playground/resources/views/home.blade.php` from this repository.

### What to add to the head 🔗

In the page head you should load the CKEditor 5 assets and Livewire scripts. If you're using Vite, include your app CSS and JS as well.

Example:

```blade
<!-- CKEditor 5 Assets -->
<x-ckeditor5-assets />

<!-- Livewire scripts -->
@livewireScripts

<!-- If you use Vite / built assets -->
@if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
  @vite(['resources/css/app.css', 'resources/js/app.js'])
@endif
```

### What to add to the page body 🧩

Place the Livewire component where you want the editor to appear. This example shows basic options: the field name (`name`), CSS class and initial content passed as an array.

Example:

```blade
<livewire:ckeditor5
  name="editor1"
  class="w-full max-w-3xl"
  :content="['main' => '<p>Initial content</p>']"
/>
```

## Vite / import configuration ⚙️🔌

Add lines below to your Vite app entrypoint so the package's JS hooks and Livewire wiring are included in your app. The `ckeditor5-livewire` package provides the integration (not the editor build itself) and is needed whether you use the cloud distribution or a self-hosted build from NPM.

```js
// playground/resources/js/app.ts
import 'ckeditor5-livewire';
```

Cloud distribution vs self-hosted (NPM):

- Cloud distribution (hosted by CKEditor) is useful if you don't want to install a build. In that case include the cloud script in the `<head>` using the assets/component described above. If you install the editor via NPM (self-hosted), the cloud script is not required and should be omitted from the head to avoid duplicate loading.

- If you rely on the cloud-hosted script (for example when loading CKEditor from a CDN or via an import map) but still build your app with Vite, add `vite-plugin-externalize-dependencies` to your Vite config so Vite doesn't bundle CKEditor into your application and the editor is loaded from the external source instead.

Example `vite.config.js` snippet (playground) showing `externalize` usage:

```js
import externalize from 'vite-plugin-externalize-dependencies';

export default defineConfig({
  plugins: [
    // other plugins...
    externalize({
      // externalize cloud distribution or CKEditor packages so they are loaded from CDN
      externals: ['ckeditor5', 'ckeditor5-premium-features'],
    }),
  ],
});
```

If you rely on the cloud-hosted script (not installed via NPM), keep the `<x-ckeditor5-assets />` in the head so the editor script is available globally.

## Psst... 👀

If you're looking for similar stuff, check these out:

- [ckeditor5-phoenix](https://github.com/Mati365/ckeditor5-phoenix)
  Seamless CKEditor 5 integration for Phoenix Framework. Plug & play support for LiveView forms with dynamic content, localization, and custom builds.

- [ckeditor5-rails](https://github.com/Mati365/ckeditor5-rails)
  Smooth CKEditor 5 integration for Ruby on Rails. Works with standard forms, Turbo, and Hotwire. Easy setup, custom builds, and localization support.

## Trademarks 📜

CKEditor® is a trademark of [CKSource Holding sp. z o.o.](https://cksource.com/) All rights reserved. For more information about the license of CKEditor® please visit [CKEditor's licensing page](https://ckeditor.com/legal/ckeditor-oss-license/).

This gem is not owned by CKSource and does not use the CKEditor® trademark for commercial purposes. It should not be associated with or considered an official CKSource product.

## License 📜

This project is licensed under the terms of the [MIT LICENSE](LICENSE).
