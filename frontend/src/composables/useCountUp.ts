import { ref } from 'vue'

export function useCountUp(duration = 1000) {
  const display = ref(0)
  let raf = 0

  function animate(target: number) {
    cancelAnimationFrame(raf)
    const start = display.value
    const diff = target - start
    if (diff === 0) return
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      display.value = Math.round(start + diff * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }

  return { display, animate }
}
