/* eslint-disable @next/next/no-img-element */
import styles from "../styles/Home.module.css";

export default function MarketItem({ nft, onBuyNft }) {
  return (
    <div className={styles.card}>
      <img src={nft.image} className={styles.image} alt="img" />
      {!onBuyNft && <p className="text-lg uppercase font-bold"> {nft.name} </p>}
      {<p className="text-lg uppercase font-bold"> {nft.description} </p>}
      <p className="text-2xs font-light">by: {nft.seller.slice(0, 4)} </p>
      {onBuyNft && (
        <button className={styles.cardButton} onClick={() => onBuyNft(nft)}>
          {nft.price} ETH
        </button>
      )}
    </div>
  );
}
