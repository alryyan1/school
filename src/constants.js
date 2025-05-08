// export const host = 'sahara-pharma.com'
export const schema = "http";
export const host = "192.168.100.70";
export const projectFolder = "school-backend";
// export const host = 'server1'مركز النعيم
import rtlPlugin from "stylis-plugin-rtl";
import createCache from '@emotion/cache';
import { prefixer } from "stylis";
export function blurForNoramlUsers() {
  // return classname has filter properties
  return "blurForNormalUsers";
}
export const url = `${schema}://${host}/${projectFolder}/public/api/`;
export const webUrl = `${schema}://${host}/${projectFolder}/public/`;
export const imagesUrl = `${schema}://${host}/${projectFolder}/public/`;


// Create a cache with right-to-left settings
export const cacheRtl = createCache({
    key: 'mui-rtl',
    stylisPlugins: [prefixer, rtlPlugin], // Add RTL support
  });

  export function formatNumber(number) {
    return String(number).replace(/^\d+/, (number) =>
      [...number]
        .map(
          (digit, index, digits) =>
            (!index || (digits.length - index) % 3 ? "" : ",") + digit
        )
        .join("")
    );
  }

  // Animation Variants (same as before)
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};
