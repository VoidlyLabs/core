import { randomUUID } from 'crypto';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { dirname, extname, join, normalize, relative, sep } from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigUtility } from '../../utility/config/config.utility';

type StorageBody = Buffer | Uint8Array | string;

export type SaveImageOptions = {
  key: string;
  body: StorageBody;
};

export type StoredImage = {
  key: string;
  path: string;
  url: string;
};

export type StoredImageInfo = StoredImage & {
  size: number;
  updatedAt: Date;
};

@Injectable()
export class StorageService {
  private readonly rootPath: string;
  private readonly publicPath: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configUtility: ConfigUtility) {
    this.rootPath = normalize(
      this.configUtility.getOptional('LOCAL_STORAGE_PATH') ?? 'storage/uploads',
    );
    this.publicPath = this.normalizePublicPath(
      this.configUtility.getOptional('LOCAL_STORAGE_PUBLIC_PATH') ?? '/uploads',
    );
    this.publicBaseUrl = this.configUtility
      .getOptional('LOCAL_STORAGE_BASE_URL')
      ?.replace(/\/$/, '');
  }

  public getRootPath(): string {
    return this.rootPath;
  }

  public getPublicPath(): string {
    return this.publicPath;
  }

  public createImageKey(originalName: string): string {
    const extension = extname(originalName).toLowerCase();

    return `${randomUUID()}${extension}`;
  }

  public async saveImage(options: SaveImageOptions): Promise<StoredImage> {
    const path = this.resolvePath(options.key);

    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, options.body);

    return this.toStoredImage(options.key, path);
  }

  public async getImageBuffer(key: string): Promise<Buffer> {
    return readFile(this.resolvePath(key));
  }

  public async getImageInfo(key: string): Promise<StoredImageInfo> {
    const path = this.resolvePath(key);
    const fileStat = await stat(path);

    return {
      ...this.toStoredImage(key, path),
      size: fileStat.size,
      updatedAt: fileStat.mtime,
    };
  }

  public async imageExists(key: string): Promise<boolean> {
    try {
      const fileStat = await stat(this.resolvePath(key));

      return fileStat.isFile();
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }

      throw error;
    }
  }

  public async deleteImage(key: string): Promise<boolean> {
    try {
      await rm(this.resolvePath(key), { force: false });

      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }

      throw error;
    }
  }

  public async listImages(prefix = ''): Promise<StoredImage[]> {
    const directory = this.resolvePath(prefix);
    const entries = await readdir(directory, {
      recursive: true,
      withFileTypes: true,
    });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const key = this.toStorageKey(join(entry.parentPath, entry.name));

        return this.toStoredImage(key, this.resolvePath(key));
      });
  }

  public getImageUrl(key: string): string {
    const publicUrl = `${this.publicPath}/${this.toUrlPath(key)}`;

    if (!this.publicBaseUrl) {
      return publicUrl;
    }

    return `${this.publicBaseUrl}${publicUrl}`;
  }

  private toStoredImage(key: string, path: string): StoredImage {
    return {
      key,
      path,
      url: this.getImageUrl(key),
    };
  }

  private resolvePath(key: string): string {
    const cleanKey = this.normalizeKey(key);
    const path = normalize(join(this.rootPath, cleanKey));
    const relativePath = relative(this.rootPath, path);

    if (relativePath.startsWith('..') || relativePath.includes(`..${sep}`)) {
      throw new Error('Storage key cannot resolve outside storage root');
    }

    return path;
  }

  private normalizeKey(key: string): string {
    return key.replace(/\\/g, '/').replace(/^\/+/, '');
  }

  private toStorageKey(path: string): string {
    return relative(this.rootPath, path).replace(/\\/g, '/');
  }

  private toUrlPath(key: string): string {
    return this.normalizeKey(key)
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');
  }

  private normalizePublicPath(path: string): string {
    const withoutTrailingSlash = path.replace(/\/$/, '');

    return withoutTrailingSlash.startsWith('/')
      ? withoutTrailingSlash
      : `/${withoutTrailingSlash}`;
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    );
  }
}
