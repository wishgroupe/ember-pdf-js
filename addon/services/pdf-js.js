import Service from '@ember/service';
import { setOwner } from '@ember/application';
/* global PDFJS */

export default class PdfJs extends Service {
  PDFJS;
  constructor(owner) {
    super(...arguments);
    setOwner(this, owner);
    let appConfig = owner.resolveRegistration('config:environment');
    let addonConfig = appConfig.emberPdfJs;
    this.PDFJS = PDFJS;
    this.PDFJS.workerSrc = addonConfig.workerSrc;
  }
}
