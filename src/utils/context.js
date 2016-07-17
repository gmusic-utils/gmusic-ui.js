export const findContextPath = () => {
  let path;
  Object.keys(window.APPCONTEXT).some((key1) => {
    if (typeof window.APPCONTEXT[key1] === 'object') {
      const firstLevel = window.APPCONTEXT[key1] || {};
      return Object.keys(firstLevel).some((key2) => {
        if (Array.isArray(firstLevel[key2]) && firstLevel[key2].length > 0) {
          const secondLevel = firstLevel[key2][0] || {};
          return Object.keys(secondLevel).some((key3) => {
            if (secondLevel[key3] && typeof secondLevel[key3] === 'object'
                && secondLevel[key3].queue && secondLevel[key3].all) {
              path = [key1, key2, key3];
              return true;
            }
            return false;
          });
        }
        return false;
      });
    }
    return false;
  });

  return path;
};

export default findContextPath;
