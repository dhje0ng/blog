import nextVitals from "eslint-config-next/core-web-vitals.js";

const asConfigArray = (config) => (Array.isArray(config) ? config : [config]);

export default [...asConfigArray(nextVitals)];
