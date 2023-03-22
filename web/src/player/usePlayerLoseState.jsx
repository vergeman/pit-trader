import { useState, useEffect } from "react";

export default function usePlayerLoseState(player, price) {
  const [isLoss, setIsLoss] = useState(false);

  const lost = player && player.hasLost(price);

  useEffect(() => {
    if (player) {
      setIsLoss(lost);
    }
  }, [player, price, lost]);

  return isLoss;
}