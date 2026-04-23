import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { reads } from '@ember/object/computed';
import { run } from '@ember/runloop';
/* global pdfjsViewer */

const { EventBus, PDFHistory, PDFLinkService, PDFViewer } = pdfjsViewer;

/**
 * Display PDF and expose basic navigation functionality.
 *
 * @argument {string} pdf Path to the file to load
 * @argument {function} onLoad Callback called on the document loads.
 * @argument {object} toolbarComponent Component to replace the default toolbar
 */
export default class PdfJs extends Component {

  @service('pdf-js') pdfJs;
  @reads('pdfJs.PDFJS') pdfLib;

  @tracked loadingTask;
  @tracked percentLoaded = 0;
  @tracked pdfDocument;
  @tracked pdfPage;
  @tracked pdfTotalPages;
  @tracked loaded = false;

  pdfLinkService;
  pdfViewer;
  pdfHistory;
  #container;

  get pdf() {
    return this.args.pdf;
  }

  get toolbarComponent() {
    return typeof this.args.toolbarComponent !== 'undefined'
      ? this.args.toolbarComponent
      : 'pdf-js-toolbar';
  }

  get didLoad() {
    return this.loaded;
  }

  @action
  onInsert(element) {
    let [container] = element.getElementsByClassName('pdfViewerContainer');
    this.#container = container;
    let eventBus = new EventBus();
    this.eventBus = eventBus;
    let pdfLinkService = new PDFLinkService({ eventBus });
    this.pdfLinkService = pdfLinkService;
    let pdfViewer = new PDFViewer({
      container,
      eventBus,
      linkService: pdfLinkService,
    });
    this.pdfViewer = pdfViewer;
    pdfLinkService.setViewer(pdfViewer);
    let pdfHistory = new PDFHistory({
      eventBus,
      linkService: pdfLinkService,
    });
    this.pdfHistory = pdfHistory;
    pdfLinkService.setHistory(pdfHistory);

    pdfViewer.currentScaleValue = 'page-fit';

    // setup the event listening to synchronise with pdf.js' modifications
    eventBus.on('pagechanging', (evt) => {
      let page = evt.pageNumber;
      run(() => {
        this.pdfPage = page;
      });
    });

    if (this.pdf) {
      this.load();
    }
  }
  // actions:

  @action
  load() {
    let uri = this.pdf;
    if(uri === null || uri === undefined){
      let viewer = this.pdfViewer;
      viewer.setDocument();
      let linkService = this.pdfLinkService;
      linkService.setDocument();
      return;
    }
    let loadingTask = this.pdfLib.getDocument(uri);
    loadingTask.onProgress = (progressData) => {
      this.percentLoaded = (100 * progressData.loaded) / progressData.total;
      if (this.args.onLoad) {
        this.args.onLoad(this.percentLoaded);
      }
    };

    loadingTask = loadingTask.promise.then((pdfDocument) => {
      this.pdfDocument = pdfDocument;
      let viewer = this.pdfViewer;
      viewer.setDocument(pdfDocument);
      let linkService = this.pdfLinkService;
      linkService.setDocument(pdfDocument);
      let history = this.pdfHistory;
      history.initialize({ fingerprint: pdfDocument.fingerprints[0] });
      this.pdfTotalPages = linkService.pagesCount;
      this.pdfPage = linkService.page;
      this.loaded = true;
      this.args.onLoad(100, pdfDocument);
    });

    this.loadingTask = loadingTask;
    return loadingTask;
  }
  @action
  changePage(changePage) {
    let pdfLinkService = this.pdfLinkService;
    switch (changePage) {
      case 'prev':
        pdfLinkService.page--;
        break;
      case 'next':
        pdfLinkService.page++;
        break;
      default:
        // regular change of page:
        pdfLinkService.page = Number.parseInt(changePage);
    }
    let pdfViewer = this.pdfViewer;
    pdfViewer.getPageView(pdfLinkService.page - 1).div.scrollIntoView();
  }

  @action
  zoom(value) {
    let pdfViewer = this.pdfViewer;
    pdfViewer.currentScaleValue = value;
    pdfViewer.update();
  }
}
