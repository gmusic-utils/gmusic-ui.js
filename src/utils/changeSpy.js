export default (o, cb) => {
  const originalFn = o.dispatchEvent;
  o.dispatchEvent = (...args) => {
    cb(...args);
    return originalFn.bind(o, ...args)();
  };
};
