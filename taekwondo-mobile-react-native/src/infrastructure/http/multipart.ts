import type { MobileUploadFile } from './http.types';

function appendMobileFile(
  formData: FormData,
  fieldName: string,
  file: MobileUploadFile,
): void {
  formData.append(fieldName, file as unknown as Blob);
}

export function createJsonMultipartFormData<T extends object>(
  data: T,
  file?: MobileUploadFile,
  dataFieldName = 'data',
  fileFieldName = 'file',
): FormData {
  const formData = new FormData();
  formData.append(
    dataFieldName,
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  );
  if (file) appendMobileFile(formData, fileFieldName, file);
  return formData;
}

export function createFileMultipartFormData(
  file?: MobileUploadFile,
  fileFieldName = 'file',
): FormData {
  const formData = new FormData();
  if (file) appendMobileFile(formData, fileFieldName, file);
  return formData;
}
