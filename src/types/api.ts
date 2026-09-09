export type ApiValidationError = { field: string; message: string };
export type ApiSuccess<T> = { success: true; message: string; data: T };
export type ApiFailure = { success: false; message: string; errors?: ApiValidationError[] };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
