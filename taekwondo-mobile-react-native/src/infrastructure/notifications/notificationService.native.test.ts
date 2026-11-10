// import {
//   AuthorizationStatus,
//   deleteToken,
//   getToken,
//   hasPermission,
//   onTokenRefresh,
//   requestPermission,
// } from '@react-native-firebase/messaging';
// import { Platform } from 'react-native';

import { notificationService } from './notificationService.native';

// const messagingMocks = {
//   deleteToken: deleteToken as jest.MockedFunction<typeof deleteToken>,
//   getToken: getToken as jest.MockedFunction<typeof getToken>,
//   hasPermission: hasPermission as jest.MockedFunction<typeof hasPermission>,
//   onTokenRefresh: onTokenRefresh as jest.MockedFunction<typeof onTokenRefresh>,
//   requestPermission: requestPermission as jest.MockedFunction<typeof requestPermission>,
// };

describe('native notification adapter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not fetch a token while Firebase messaging is disabled', async () => {
    // if (Platform.OS === 'ios') {
    //   messagingMocks.hasPermission.mockResolvedValueOnce(AuthorizationStatus.NOT_DETERMINED);
    // }

    await expect(notificationService.getToken({ requestPermission: false })).resolves.toBeNull();
    await expect(notificationService.getToken({ requestPermission: true })).resolves.toBeNull();
    // expect(messagingMocks.requestPermission).not.toHaveBeenCalled();
    // expect(messagingMocks.getToken).not.toHaveBeenCalled();
  });

  it('returns no-op unsubscribe functions and cleanup resolves while Firebase messaging is disabled', async () => {
    // const unsubscribe = jest.fn();
    const listener = jest.fn();

    expect(notificationService.subscribeToTokenRefresh(listener)).toEqual(expect.any(Function));
    expect(notificationService.subscribeToForegroundMessages(listener)).toEqual(expect.any(Function));
    await notificationService.cleanup();

    expect(listener).not.toHaveBeenCalled();
    // expect(messagingMocks.onTokenRefresh).toHaveBeenCalledWith(expect.any(Object), listener);
    // expect(messagingMocks.deleteToken).toHaveBeenCalledTimes(1);
  });
});
