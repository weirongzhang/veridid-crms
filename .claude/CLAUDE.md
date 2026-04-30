# Wallet App (Bifold) Guide

The wallet application lives under `wallet/` — a React Native project.

## Commands

```bash
cd wallet

# Installation
yarn install            # install dependencies
yarn build              # build core packages (required for app)

# Running App (samples/app)
cd samples/app
yarn start              # start Metro bundler
yarn ios                # run on iOS Simulator
yarn android            # run on Android Emulator

# iOS specific
cd ios && pod install   # install CocoaPods dependencies
```

## Environment

- **Node Version**: v24.12.0 (configured in `.nvmrc`)
- **Platform**: iOS
