import confetti from "canvas-confetti"

export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#0F2854", "#1C4D8D", "#4988C4", "#BDE8F5"],
  })
}

export const triggerSchoolPrideConfetti = () => {
  const end = Date.now() + 3 * 1000

  const colors = ["#0F2854", "#1C4D8D", "#4988C4", "#BDE8F5"]
  ;(function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    })

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}
