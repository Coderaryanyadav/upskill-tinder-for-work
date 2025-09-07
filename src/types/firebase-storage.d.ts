import { FirebaseStorage } from 'firebase/storage';

declare module 'firebase/storage' {
  export function getStorage(app?: FirebaseApp): FirebaseStorage;
  export function ref(storage: FirebaseStorage, path?: string): StorageReference;
  export function uploadBytes(
    ref: StorageReference,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata
  ): Promise<UploadResult>;
  export function getDownloadURL(ref: StorageReference): Promise<string>;
  export function deleteObject(ref: StorageReference): Promise<void>;
  export function listAll(ref: StorageReference): Promise<ListResult>;
  export function getMetadata(ref: StorageReference): Promise<FullMetadata>;

  export interface StorageReference {
    fullPath: string;
    name: string;
    bucket: string;
    storage: FirebaseStorage;
    parent: StorageReference | null;
    root: StorageReference;
  }

  export interface UploadMetadata {
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLanguage?: string;
    contentType?: string;
    customMetadata?: {
      [key: string]: string;
    };
  }

  export interface UploadResult {
    metadata: FullMetadata;
    ref: StorageReference;
  }

  export interface ListResult {
    items: StorageReference[];
    prefixes: StorageReference[];
    nextPageToken?: string;
  }

  export interface FullMetadata extends UploadMetadata {
    bucket: string;
    generation: string;
    metageneration: string;
    fullPath: string;
    name: string;
    size: number;
    timeCreated: string;
    updated: string;
    md5Hash?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLanguage?: string;
    contentType?: string;
    downloadTokens?: string[];
  }
}
