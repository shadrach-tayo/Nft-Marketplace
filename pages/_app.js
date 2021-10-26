import '../styles/globals.css'
import "../styles/Home.module.css";
import "../styles/create.css";
import Header from '../components/Header'
import { Web3ContextProvider } from '../context/web3ProviderContext';

function MyApp({ Component, pageProps }) {
  return (
    <Web3ContextProvider>
      <Header />
      <Component {...pageProps} />
    </Web3ContextProvider>
  )
}

export default MyApp
