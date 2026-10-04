const TEST_UID = 'test-user-123';

export function mockAuthStore(uid: string = TEST_UID) {
  return {
    useAuthStore: {
      getState: () => ({
        user: uid ? { uid } : null,
        loading: false,
        isLoggingOut: false,
      }),
    },
  };
}
