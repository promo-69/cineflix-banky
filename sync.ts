import { sequelize } from './src/lib/server/database/db';
import './src/lib/server/database/models';

sequelize.sync({ alter: true })
  .then(() => {
    console.log('DB successfully synced with new models');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to sync DB:', err);
    process.exit(1);
  });
