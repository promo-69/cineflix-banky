export { User } from './User';
export { Transaction } from './Transaction';
export { TransactionTransfer } from './TransactionTransfer';
export { TransactionMobilePayment } from './TransactionMobilePayment';
export { AccountDirectory } from './AccountDirectory';
export { MobilePaymentDirectory } from './MobilePaymentDirectory';
export { Card } from './Card';

import { User } from './User';
import { Transaction } from './Transaction';
import { TransactionTransfer } from './TransactionTransfer';
import { TransactionMobilePayment } from './TransactionMobilePayment';
import { AccountDirectory } from './AccountDirectory';
import { MobilePaymentDirectory } from './MobilePaymentDirectory';
import { Card } from './Card';

// Define associations here if not already defined elsewhere
User.hasMany(Card, { foreignKey: 'user_id' });
Card.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AccountDirectory, { foreignKey: 'user_id' });
AccountDirectory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(MobilePaymentDirectory, { foreignKey: 'user_id' });
MobilePaymentDirectory.belongsTo(User, { foreignKey: 'user_id' });
