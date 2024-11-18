import { Component, OnInit } from '@angular/core';

import * as SDCCore from 'scandit-web-datacapture-core';
import * as SDCBarcode from 'scandit-web-datacapture-barcode';

@Component({
 selector: 'app-scanner',
 templateUrl: './scanner.component.html',
 styleUrls: ['./scanner.component.css']
})

export class ScannerComponent implements OnInit {

 constructor() { }

 async ngOnInit(): Promise<void> {
  
   await SDCCore.configure({
     licenseKey: "LICENSE_KEY_HERE",
     libraryLocation: "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-barcode@6.x/build/engine/",
     moduleLoaders: [SDCBarcode.barcodeCaptureLoader()]
   });

   const context = await SDCCore.DataCaptureContext.create();

    const camera = SDCCore.Camera.default;
    await context.setFrameSource(camera);

    const settings = new SDCBarcode.BarcodeCaptureSettings();
    settings.enableSymbologies([
      SDCBarcode.Symbology.Code128,
      SDCBarcode.Symbology.Code39,
      SDCBarcode.Symbology.QR,
      SDCBarcode.Symbology.EAN8,
      SDCBarcode.Symbology.UPCE,
      SDCBarcode.Symbology.EAN13UPCA,
      SDCBarcode.Symbology.DataMatrix
    ]);

    const symbologySetting = settings.settingsForSymbology(SDCBarcode.Symbology.Code39);
    symbologySetting.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const barcodeCapture = await SDCBarcode.BarcodeCapture.forContext(context, settings);
    await barcodeCapture.setEnabled(false);

    barcodeCapture.addListener({
      didScan: async (barcodeCapture, session) => {
        await barcodeCapture.setEnabled(false);
        const barcode = session.newlyRecognizedBarcodes[0];
        const symbology = new SDCBarcode.SymbologyDescription(barcode.symbology);
        alert("Scanned: "+barcode.data+" "+symbology.readableName);
        await barcodeCapture.setEnabled(true);
      },
    });


    const view = await SDCCore.DataCaptureView.forContext(context);
    view.connectToElement(document.getElementById("data-capture-view")!);
    view.addControl(new SDCCore.CameraSwitchControl());

    const barcodeCaptureOverlay = 
      await SDCBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
      barcodeCapture,
      view,
      SDCBarcode.BarcodeCaptureOverlayStyle.Frame
    );

    const viewfinder = new SDCCore.RectangularViewfinder(
      SDCCore.RectangularViewfinderStyle.Square,
      SDCCore.RectangularViewfinderLineStyle.Light
    );
    await barcodeCaptureOverlay.setViewfinder(viewfinder); 

    await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
    await barcodeCapture.setEnabled(true);
  }
}