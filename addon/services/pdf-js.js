import Service from '@ember/service';
import { setOwner } from '@ember/application';
/* global pdfjsLib, pdfjsViewer */

export default class PdfJs extends Service {
  PDFJS;
  pdfjsViewer;
  constructor(owner) {
    super(...arguments);
    setOwner(this, owner);
    let appConfig = owner.resolveRegistration('config:environment');
    let addonConfig = appConfig.emberPdfJs;
    this.PDFJS = pdfjsLib;
    this.pdfjsViewer = pdfjsViewer;
    this.PDFJS.GlobalWorkerOptions.workerSrc = addonConfig.workerSrc;
  }
}
