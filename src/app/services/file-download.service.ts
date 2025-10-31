import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor() { }

  public downloadFile(blob: Blob, filename: string): void {
    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Append the anchor to the body, trigger the click, and then remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the object URL to free up memory
    window.URL.revokeObjectURL(url);
  }
}
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class FileDownloadService {

//   constructor() { }

//   // **CRITICAL FIX: This method was missing**
//   downloadFile(blob: Blob, filename: string): void {
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   }
// }
