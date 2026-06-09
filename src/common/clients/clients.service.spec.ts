import { compare } from 'bcryptjs';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  const model = { modelName: 'ClientModel' };
  let mongooseService: {
    getModel: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    updateOne: jest.Mock;
    deleteById: jest.Mock;
  };
  let service: ClientsService;

  beforeEach(() => {
    mongooseService = {
      getModel: jest.fn().mockReturnValue(model),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(async (_model, data) => ({ _id: 'client-id', ...data })),
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

  it('hashes password before creating a client', async () => {
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
    mongooseService.updateOne.mockImplementation(
      async (_model, _filter, data) => data,
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

  it('uses atomic balance debit guarded by sufficient balance', async () => {
    await service.debitBalanceIfSufficient('client-id', 15);

    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'client-id', balance: { $gte: 15 } },
      { $inc: { balance: -15 } },
    );
  });

  it('increments balance atomically', async () => {
    await service.incrementBalance('client-id', 20);

    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'client-id' },
      { $inc: { balance: 20 } },
    );
  });
});
