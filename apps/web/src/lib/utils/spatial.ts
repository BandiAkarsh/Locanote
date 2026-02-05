/**
 * SPATIAL INTERACTION ACTION (use:spatial)
 *
 * Applies a 3D parallax tilt effect to any element based on mouse position.
 * Perfectly calibrated for Glassmorphism 2.0 aesthetics.
 */
export function spatial(
  node: HTMLElement,
  options = { intensity: 12, scale: 1.05 },
) {
  let rect = node.getBoundingClientRect();

  function handleMouseMove(e: MouseEvent) {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -options.intensity;
    const rotateY = ((x - centerX) / centerX) * options.intensity;

    node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${options.scale})`;
    node.style.zIndex = "50";
  }

  function handleMouseLeave() {
    node.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    node.style.zIndex = "1";
    node.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
  }

  function handleResize() {
    rect = node.getBoundingClientRect();
  }

  node.addEventListener("mousemove", handleMouseMove);
  node.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("resize", handleResize);

  return {
    destroy() {
      node.removeEventListener("mousemove", handleMouseMove);
      node.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    },
  };
}
