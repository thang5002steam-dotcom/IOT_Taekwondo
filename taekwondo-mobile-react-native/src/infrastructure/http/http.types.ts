export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message: string;
  statusCode: number;
}

export type MobileUploadFile = {
  uri: string;
  name: string;
  type: string;
};
