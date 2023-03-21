import { useState, useEffect } from "react";

export default function usePlayerLoseState(player, price) {
  const [isLoss, setIsLoss] = useState(false);

  useEffect(() => {
    if (player) {
      const lost = player.hasLost(price);
      setIsLoss(lost);
    }
  }, [player, price]);

  return isLoss;
}