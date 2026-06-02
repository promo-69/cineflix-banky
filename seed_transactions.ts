import { User } from './src/lib/server/database/models';
import { LedgerService } from './src/lib/server/services/LedgerService';

async function run() {
  const sender = await User.findOne({ where: { document_id: 'V-12345678' } });
  if (!sender) {
    console.error('Sender not found');
    process.exit(1);
  }

  let receiver = await User.findOne({ where: { document_id: { $not: 'V-12345678' } } });
  if (!receiver) {
    // try to get any other user
    const users = await User.findAll();
    receiver = users.find(u => u.document_id !== 'V-12345678');
  }
  if (!receiver) {
    console.error('Receiver not found');
    process.exit(1);
  }

  console.log(`Transferring from ${sender.document_id} to ${receiver.document_id}`);

  for (let i = 0; i < 30; i++) {
    try {
      await LedgerService.processTransfer(
        sender.id,
        receiver.document_id,
        receiver.account_number,
        10,
        `Test transfer ${i + 1}`
      );
      console.log(`Transfer ${i + 1} completed`);
    } catch (err: any) {
      console.error(`Error on transfer ${i + 1}: ${err.message}`);
    }
  }
}

run().then(() => {
  console.log('Done');
  process.exit(0);
});
