import '../styles/globals.css'
import "../styles/Home.module.css";
import "../styles/create.css";
import Header from '../components/Header'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      {/* <nav className="border-b px-12 py-6">
        <p className="text-xl">NFT Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-blue-500">
              Home
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-4 text-blue-500">
              Create NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-4 text-blue-500">
              My NFTSs
            </a>
          </Link>
        </div>
      </nav> */}
      <Header />
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
