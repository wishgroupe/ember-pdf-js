import Service from '@ember/service';
import { setOwner } from '@ember/application';
/* global pdfjsLib, pdfjsViewer */

// pdfjs-dist 3.x rejects execution when Array/Object prototypes have
// enumerable properties (Ember's EXTEND_PROTOTYPES adds them as enumerable,
// which breaks `for...in` iteration used internally by pdfjs).
// Make them non-enumerable to satisfy pdfjs without disabling Ember's
// prototype extensions in the host app.
function hideProtoExtensions(proto) {
  for (const name of Object.getOwnPropertyNames(proto)) {
    const d = Object.getOwnPropertyDescriptor(proto, name);
    if (d && d.enumerable && d.configurable) {
      Object.defineProperty(proto, name, { ...d, enumerable: false });
    }
  }
}

let prototypesPatched = false;
function patchPrototypesOnce() {
  if (prototypesPatched) return;
  hideProtoExtensions(Array.prototype);
  hideProtoExtensions(Object.prototype);
  prototypesPatched = true;
}

export default class PdfJs extends Service {
  PDFJS;
  pdfjsViewer;
  constructor(owner) {
    super(...arguments);
    setOwner(this, owner);
    patchPrototypesOnce();
    let appConfig = owner.resolveRegistration('config:environment');
    let addonConfig = appConfig.emberPdfJs;
    this.PDFJS = pdfjsLib;
    this.pdfjsViewer = pdfjsViewer;
    this.PDFJS.GlobalWorkerOptions.workerSrc = addonConfig.workerSrc;
  }
}
