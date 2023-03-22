import { useEffect, useState } from "react";

export default function useNPCPlayerDraw(canvasRef, npcPlayerManager, landmarks) {

  useEffect(() => {
    console.log("[useNPCPlayerDraw] init");

    if (npcPlayerManager) {

      const canvasCtx = canvasRef && canvasRef.current.getContext("2d");

      //canvasCtx.save();

      let x = 0;
      const players = Object.values(npcPlayerManager.players);
      for (let player of players) {

        const drawing = new Image();
        drawing.src = player.img;
        canvasCtx.drawImage(drawing, x, 0);

        x+= 100;
      }

      //canvasCtx.restore();
    }
  }, [landmarks]);

}