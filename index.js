'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

const neededJsFiles = ['pdf.js', 'pdf.worker.js'];

module.exports = {
  name: require('./package').name,
  // eslint-disable-next-line no-unused-vars
  included(app, parentAddon) {
    this._super.included.apply(this, arguments);
    while (app.app) {
      app = app.app;
    }
    // let target = parentAddon || app
    // target.import(`${target.bowerDirectory}/pdfjs-dist/build/pdf.js`)
    // target.import(`${target.bowerDirectory}/pdfjs-dist/build/pdf.worker.js`)
    // target.import(`${target.bowerDirectory}/pdfjs-dist/web/pdf_viewer.js`)
    // target.import(`${target.bowerDirectory}/pdfjs-dist/web/pdf_viewer.css`)
    const rs = require.resolve('pdfjs-dist');
    let pdfjsPath = path.dirname(path.dirname(rs));
    this.pdfjsNode = new UnwatchedDir(pdfjsPath);
    app.import('vendor/pdfjs-dist/build/pdf.js');
    app.import('vendor/pdfjs-dist/build/pdf.worker.js');
    app.import('vendor/pdfjs-dist/web/pdf_viewer.js');
    app.import('vendor/pdfjs-dist/web/pdf_viewer.css');
  },
  treeForPublic(tree) {
    // let workerPath = path.join(this.project.root, 'bower_components', 'pdfjs-dist', 'build')
    // let pdfJsImages = path.join(this.project.root, 'bower_components', 'pdfjs-dist', 'web', 'images')

    let pdfJsImagesTree = new Funnel(this.pdfjsNode, {
      srcDir: 'web/images',
      destDir: '/assets/images',
    });
    let pdfJsFilesTree = new Funnel(this.pdfjsNode, {
      srcDir: 'build',
      include: neededJsFiles,
      destDir: '/',
    });

    if (tree) {
      return mergeTrees([tree, pdfJsFilesTree, pdfJsImagesTree]);
    } else {
      return mergeTrees([pdfJsFilesTree, pdfJsImagesTree]);
    }
  },

  treeForVendor(vendorTree) {
    let trees = [];

    if (vendorTree) {
      trees.push(vendorTree);
    }
    trees.push(
      Funnel(this.pdfjsNode, {
        srcDir: 'build',
        include: ['pdf.js', 'pdf.worker.js'],
        destDir: 'pdfjs-dist/build',
      })
    );

    trees.push(
      Funnel(this.pdfjsNode, {
        srcDir: 'web',
        include: ['pdf_viewer.js', 'pdf_viewer.css'],
        destDir: 'pdfjs-dist/web',
      })
    );

    return mergeTrees(trees);
  },
};
