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
     licenseKey: "AhNFci2fCE7bEFujPD0n894sXhF6A9okxQTlJB8Kry9qPOGFSXfMvIxRWaxVCSSz7Fo2ZGRNRMfbSSCnZEWunuRgG6pZfBo9ZGnlsqozSKIIb4C9FAj64WwL4mkRHZWx3z+5/mRxSS3oa4gOCVtB9UJC4oFaFsxWdRHYfBYVIGAYXHtKXUM0PDtGyfqBPREX3x84RzEoUVvjfKQke0RC60heOkmsD4yDKgn9mMcXl297Bl+nWzouF7x+Iew/U13zKwy7lr4dWNqLGoMX1hOAYNs96kD6KKzy5DUgp8ofnHvCaQrooDjGo5kYSPXXGuG7nBWozMENFvv9GqtZvjlevpUY9UlINPk9AmNjT+lQ2X2Mew29LmGObFwKie2BXG6e3VLFW5NkifcAdkQXORzYg4t8xjKldnjSwEQf8IodZGQ7ehJoJSSgW/1mZuIyc5yWclQwuPRZ5GNRL+lUdDpA8GdvBdlcaw9nNkxcgXs469mLVAuV5WP5B88E2FRYL/h8OmE382ZMfGPaXTdcAD4EqI18uhU+AHbv8kASwDdp8sUbHgT7eQaJcoZVLd1caiO2YELmmeRToBQyC/w+9le+23RyErUbTNXtVCjR4RMf794oWFPBVWD7J/lvlEpDWjG0ezD32Td48Qk8DDDNmEaKlGkO2qtqflpvQ3Fcoc9qB4s5b9IgHhq8SUpWNy0fR6EfSD5fu7lF4w6kenTPTFGIkVgQEsxfRWMZ3xaU8K1H16ASStyjnAIwWXI1gpcIdMGl+UdrzOc0Tznzh/iRXnykCd1jIlLQA9o+7u0rktgUSNz03nrixNZcfLw5iZmJy+xPIHwxCI00gDSvdhkz9xNf9eEh1KtRA+fOKbd86ld0MdymRkbhWpJlcaKgjGuf2ksloOtLkkBql8lJK+Olyo4wQu1zHRsGPnpD7GHjkat0Sl+mAnUgDvtvdNjs+BsXcyEc08vLoZmyyHFq6YhfqpOU8XQ/qzhVqNmCQgdh+n1ln9ei0Nirj4/qpBvVZzBXJ6z26wGcEfQKalGHN4qDOf7AaHgSNgU//IDnoCdI2f5lY6acWOzdjyKootSOAkRXId5fbyllmKJ5n2tlFvkQLLevtHxZJdORLTkpxOhL+i8HLTzpx7/ywwbyjcXRxg54KDsLaybO8llT1Hhz6DxvFYLk1fAGk7CFm5E2B5jBfALNvtFiVO96XOmQmrnFQ258PlmEABWFUCAX1DRM083Kmw+PCW6gNy5IptpGHQaLOxKGHdcRpYEqlyzklOMubSHBQ32FxPOO+XmXXMeXlZnJkjbASrqX8rZtdml7uf0gsfD5pqt1N+Vv25926e4ng+RKKFnbJdAdwo5gxYiO+QIjXuQUV63S1tsailqmaJr8tKS11GbXa2fhRrkN/nwDAxqXYZHR9Vy37xHwoXpMKFvFpIVI9Jux8KlMYCQDT/RQzw==",
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