const _ = require("lodash");

// Helper function to detect circular references
const toCamelCase = (data, visited = new WeakSet()) => {
  if (Array.isArray(data)) {
    return data.map((item) => toCamelCase(item, visited));
  } else if (data !== null && typeof data === "object") {
    if (visited.has(data)) {
      return {};
    }

    visited.add(data);

    return Object.keys(data).reduce((result, key) => {
      result[_.camelCase(key)] = toCamelCase(data[key], visited);
      return result;
    }, {});
  }
  return data;
};

const normalizeTimestamps = (data) => {
  if (!data) {
    return data;
  }
  return {
    ...data,
    createdAt: data.created_at || null,
    updatedAt: data.updated_at || null,
  };
};

const removeCircularReferences = (data) => {
  const cache = new Set();
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return; // Circular reference found, return undefined
        }
        cache.add(value);
      }
      return value;
    }),
  );
};

module.exports = { toCamelCase, normalizeTimestamps, removeCircularReferences };
