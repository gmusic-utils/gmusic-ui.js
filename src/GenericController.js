export default class GenericController {
  constructor() {
    this.controls = {};
    const that = this;
    this.addMethod('init', function init() {
      that.emitter = this;
    });
  }

  addMethod(methodName, method) {
    this.controls[methodName] = method;
  }

  getController() {
    return this.controls;
  }
}
