// jest.mock('@react-native-firebase/app', () => ({}));
// jest.mock('@react-native-firebase/messaging', () => ({
//   AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
//   getMessaging: jest.fn(() => ({})),
//   getToken: jest.fn(async () => null),
//   hasPermission: jest.fn(async () => 0),
//   requestPermission: jest.fn(async () => 0),
//   onMessage: jest.fn(() => jest.fn()),
//   onTokenRefresh: jest.fn(() => jest.fn()),
//   deleteToken: jest.fn(async () => undefined),
//   setBackgroundMessageHandler: jest.fn(),
// }));

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return new Proxy(
    {},
    {
      get: () => (props: object) => React.createElement(View, props),
    },
  );
});

jest.mock(
  "reicon-react-native",
  () => {
    const React = require("react");
    const { View } = require("react-native");
    return new Proxy(
      {},
      {
        get: () => (props: object) => React.createElement(View, props),
      },
    );
  },
  { virtual: true },
);
