import { ProductsService } from './products.service';

describe('Admin ProductsService', () => {
  const model = { modelName: 'ProductModel' };
  let mongooseService: {
    getModel: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    updateOne: jest.Mock;
    deleteById: jest.Mock;
  };
  let storageService: {
    saveImage: jest.Mock;
    deleteImage: jest.Mock;
    getPublicPath: jest.Mock;
  };
  let service: ProductsService;

  beforeEach(() => {
    mongooseService = {
      getModel: jest.fn().mockReturnValue(model),
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      deleteById: jest.fn(),
    };
    storageService = {
      saveImage: jest.fn(),
      deleteImage: jest.fn(),
      getPublicPath: jest.fn().mockReturnValue('/storage'),
    };
    service = new ProductsService(
      mongooseService as any,
      storageService as any,
    );
  });

  it('builds update query only from provided product fields', async () => {
    await service.update('product-id', {
      name: 'Keyboard',
      price: 99,
    });

    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'product-id' },
      { name: 'Keyboard', price: 99 },
    );
  });

  it('stores new image and deletes previous image when extension changes', async () => {
    mongooseService.findById.mockResolvedValue({
      _id: { toString: () => 'product-id' },
      imageUrl: '/storage/products/product-id/image.png',
    });
    storageService.saveImage.mockResolvedValue({
      url: '/storage/products/product-id/image.jpg',
    });

    await service.updateImage('product-id', {
      originalname: 'photo.JPG',
      buffer: Buffer.from('image'),
    });

    expect(storageService.saveImage).toHaveBeenCalledWith({
      key: 'products/product-id/image.jpg',
      body: Buffer.from('image'),
    });
    expect(storageService.deleteImage).toHaveBeenCalledWith(
      'products/product-id/image.png',
    );
    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'product-id' },
      { imageUrl: '/storage/products/product-id/image.jpg' },
    );
  });

  it('does not touch storage when updating image for missing product', async () => {
    mongooseService.findById.mockResolvedValue(null);

    await expect(
      service.updateImage('missing-id', {
        originalname: 'photo.jpg',
        buffer: Buffer.from('image'),
      }),
    ).resolves.toBeNull();
    expect(storageService.saveImage).not.toHaveBeenCalled();
  });

  it('deletes product image after successful product deletion', async () => {
    mongooseService.findById.mockResolvedValue({
      _id: { toString: () => 'product-id' },
      imageUrl: 'https://cdn.example.com/storage/products/product-id/image.jpg',
    });
    mongooseService.deleteById.mockResolvedValue(true);

    await expect(service.deleteById('product-id')).resolves.toBe(true);
    expect(storageService.deleteImage).toHaveBeenCalledWith(
      'products/product-id/image.jpg',
    );
  });

  it('does not delete image when product deletion fails', async () => {
    mongooseService.findById.mockResolvedValue({
      _id: { toString: () => 'product-id' },
      imageUrl: '/storage/products/product-id/image.jpg',
    });
    mongooseService.deleteById.mockResolvedValue(false);

    await expect(service.deleteById('product-id')).resolves.toBe(false);
    expect(storageService.deleteImage).not.toHaveBeenCalled();
  });
});
