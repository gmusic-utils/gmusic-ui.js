export default class GMusicNamespace {
  constructor() {
    this.prototype = {};
    const that = this;
    this.addMethod('init', function init() {
      that.emitter = this;
    });
  }

  addMethod(methodName, method) {
    this.prototype[methodName] = method;
  }

  getPrototype() {
    return this.prototype;
  }
}
