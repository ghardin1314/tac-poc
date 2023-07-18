import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli, polygonMumbai } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({ apiKey: 'OGnAWpUHVexy2UbQPpq7GNxXZODL-KO6' }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'TAC POC',
  chains,
  projectId: 'dc54faff936797f790dc01ed7d52a3be',
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  // webSocketPublicClient,
});

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Head>
          <title>Welcome to client!</title>
        </Head>
        <main className="app flex w-screen">
          <Component {...pageProps} />
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default CustomApp;
