export class MultipartBody {
  file: File;
  fileName: string;

  constructor(file: File, fileName: string) {
    this.file = file;
    this.fileName = fileName;
  }

  toFormData(): FormData {
    const formData = new FormData();
    formData.append('file', this.file, this.fileName);
    formData.append('fileName', this.fileName);
    return formData;
  }
}
