import { clsx } from "clsx";

/**
 * Merges class names safely.
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Lightweight, standard-compliant implementation of class-variance-authority (cva)
 * for shadcn/ui components without external native binary dependencies.
 */
export function cva(base, config = {}) {
  const { variants = {}, defaultVariants = {} } = config;

  return function (props = {}) {
    const classList = [base];

    // Combine default variants with passed props
    const mergedProps = { ...defaultVariants, ...props };

    // Apply variant classes
    for (const [variantKey, variantOptions] of Object.entries(variants)) {
      const selectedValue = mergedProps[variantKey];
      if (selectedValue && variantOptions[selectedValue]) {
        classList.push(variantOptions[selectedValue]);
      }
    }

    if (props.className) {
      classList.push(props.className);
    }

    return cn(...classList);
  };
}
