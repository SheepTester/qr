# QR code transceiver

[Live on GitHub Pages](https://sheeptester.github.io/qr/)

A simple QR code generator and scanner React app. Uses [node-qrcode](https://www.npmjs.com/package/qrcode) to generate QR codes and [QR Scanner](https://www.npmjs.com/package/qr-scanner) to scan them.

I don't think I've seen a web-based app that can both generate and scan QR codes. Being able to do both so is useful as an alternative to something like Airdrop between non-Apple devices that you don't own. Previously, I was using Google Lens or [my previous scanner](https://sheeptester.github.io/javascripts/qr.html) to scan QR codes in images, [this demo](https://nimiq.github.io/qr-scanner/demo/) for scanning QR codes from the web cam, and [this demo](https://datalog.github.io/demo/qrcode-svg/) for generating SVG QR codes. I like these options because they don't have ads.

## Features

I plan to have the following features:

- Generator
  - [x] text input at bottom
  - [x] show ECL levels with percentages
  - [x] copy or download PNG and SVG
  - [x] override mask
  - [ ] upload any file
- Scanner
  - [x] paste image
  - [x] drop image
  - [x] select image
  - [x] turn on camera
  - [x] flip camera
  - [x] select camera
  - [ ] option to auto open URL
  - [ ] result history
  - [x] copy result
  - [x] auto link URLs

## Development

```shell
# Install dependencies
$ yarn

# Start dev server
$ yarn dev

# Build
$ yarn build
```
