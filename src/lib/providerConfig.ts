export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WABBIT_USE_MOCK_API === "true";
}

export function getProviderApiKey(provider?: string): string | undefined {
  void provider;

  if (isMockApiEnabled()) {
    return "mock-api-key";
  }

  return undefined;
}
