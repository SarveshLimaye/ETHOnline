export const TOKENS = {
  baseSepolia: {
    USDC: "0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f",
    USDT: "0x0a215D8ba66387DCA84B284D18c3B4ec3de6E54a",
    WBTC: "0x54114591963CF60EF3aA63bEfD6eC263D98145a4",
    cbETH: "0xD171b9694f7A2597Ed006D41f7509aaD4B485c4B",
  },
};

export const getSymbolFromAddress = (address: string) => {
  const tokens = TOKENS["baseSepolia" as keyof typeof TOKENS];
  for (const [symbol, addr] of Object.entries(tokens)) {
    if (addr.toLowerCase() === address.toLowerCase()) {
      return symbol;
    }
  }
  return null;
};
