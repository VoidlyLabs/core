import { compare } from 'bcryptjs';
import { ClientsService } from './clients.service';

describe('Admin ClientsService', () => {
  const model = { modelName: 'ClientModel' };
  let mongooseService: {
    getModel: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    updateOne: jest.Mock;
    deleteById: jest.Mock;
  };
  let service: ClientsService;

  beforeEach(() => {
    mongooseService = {
      getModel: jest.fn().mockReturnValue(model),
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((_model, data) =>
        Promise.resolve({ _id: 'client-id', ...data }),
      ),
      updateOne: jest.fn(),
      deleteById: jest.fn(),
    };

    service = new ClientsService(
      mongooseService as any,
      {
        get: jest.fn().mockReturnValue('1'),
      } as any,
    );
  });

  it('lists clients', async () => {
    await service.find();

    expect(mongooseService.find).toHaveBeenCalledWith(model, {});
  });

  it('finds a client by username', async () => {
    await service.findByUsername('client');

    expect(mongooseService.findOne).toHaveBeenCalledWith(model, {
      username: 'client',
    });
  });

  it('hashes password before creating a client and allows admin balance', async () => {
    const created = await service.create({
      username: 'client',
      password: 'plain-password',
      balance: 25,
    });

    expect(mongooseService.create).toHaveBeenCalledWith(
      model,
      expect.objectContaining({
        username: 'client',
        balance: 25,
      }),
    );
    expect(created.password).not.toBe('plain-password');
    await expect(compare('plain-password', created.password)).resolves.toBe(
      true,
    );
  });

  it('hashes password on update but preserves non-password fields', async () => {
    mongooseService.updateOne.mockImplementation((_model, _filter, data) =>
      Promise.resolve(data),
    );

    const updated = await service.update('client-id', {
      password: 'new-password',
      balance: 10,
    });

    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'client-id' },
      expect.objectContaining({ balance: 10 }),
    );
    expect(updated?.password).not.toBe('new-password');
    await expect(compare('new-password', updated?.password)).resolves.toBe(
      true,
    );
  });

  it('deletes clients by id', async () => {
    await service.deleteById('client-id');

    expect(mongooseService.deleteById).toHaveBeenCalledWith(model, 'client-id');
  });
});
