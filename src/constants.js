// export const host = 'sahara-pharma.com'
export const schema = "http";
export const host = "127.0.0.1";
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
export const imagesUrl = `${schema}://${host}/${projectFolder}/public/storage/`;


// Create a cache with right-to-left settings
export const cacheRtl = createCache({
    key: 'mui-rtl',
    stylisPlugins: [prefixer, rtlPlugin], // Add RTL support
  });

