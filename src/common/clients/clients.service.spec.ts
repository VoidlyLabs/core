import { ClientsService } from './clients.service';

describe('Common ClientsService', () => {
  const model = { modelName: 'ClientModel' };
  let mongooseService: {
    getModel: jest.Mock;
    findById: jest.Mock;
    updateOne: jest.Mock;
  };
  let service: ClientsService;

  beforeEach(() => {
    mongooseService = {
      getModel: jest.fn().mockReturnValue(model),
      findById: jest.fn(),
      updateOne: jest.fn(),
    };

    service = new ClientsService(mongooseService as any);
  });

  it('finds a client by id', async () => {
    await service.findById('client-id');

    expect(mongooseService.findById).toHaveBeenCalledWith(model, 'client-id');
  });

  it('uses atomic balance debit guarded by sufficient balance', async () => {
    await service.debitBalanceIfSufficient('client-id', 15);

    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'client-id', balance: { $gte: 15 } },
      { $inc: { balance: -15 } },
    );
  });

  it('increments balance atomically for internal refunds', async () => {
    await service.incrementBalance('client-id', 20);

    expect(mongooseService.updateOne).toHaveBeenCalledWith(
      model,
      { _id: 'client-id' },
      { $inc: { balance: 20 } },
    );
  });
});
