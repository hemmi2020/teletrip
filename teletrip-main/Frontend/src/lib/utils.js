/**
 * Lightweight, zero-dependency class name builder compatible with clsx/classnames.
 */
function toVal(mix) {
  let k, y, str = '';
  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      const len = mix.length;
      for (k = 0; k < len; k++) {
        if (mix[k]) {
          if ((y = toVal(mix[k]))) {
            if (str) str += ' ';
            str += y;
          }
        }
      }
    } else if (mix) {
      for (y in mix) {
        if (mix[y]) {
          if (str) str += ' ';
          str += y;
        }
      }
    }
  }
  return str;
}

export function clsx(...args) {
  let i = 0, tmp, x, str = '';
  const len = args.length;
  for (; i < len; i++) {
    if ((tmp = args[i])) {
      if ((x = toVal(tmp))) {
        if (str) str += ' ';
        str += x;
      }
    }
  }
  return str;
}

/**
 * Standard utility to merge class names safely.
 */
export function cn(...inputs) {
  return clsx(...inputs);
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
