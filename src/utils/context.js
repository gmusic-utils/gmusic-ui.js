export const findContextPath = () => {
  let path;
  Object.keys(window.APPCONTEXT).forEach((key1) => {
    if (typeof window.APPCONTEXT[key1] === 'object') {
      const firstLevel = window.APPCONTEXT[key1] || {};
      Object.keys(firstLevel).forEach((key2) => {
        if (Array.isArray(firstLevel[key2]) && firstLevel[key2].length > 0) {
          const secondLevel = firstLevel[key2][0] || {};
          Object.keys(secondLevel).forEach((key3) => {
            if (secondLevel[key3] && typeof secondLevel[key3] === 'object'
                && secondLevel[key3].queue && secondLevel[key3].all) {
              path = [key1, key2, key3];
            }
          });
        }
      });
    }
  });

  return path;
};
